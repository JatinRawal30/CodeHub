const { user } = require("../models/user");
const Submission = require("../models/Submission");
const { userValidation, loginValidation } = require("../utils/validateReqBody");
const { hashPassword, comparePasswords } = require("../utils/hashing");
const { generateToken, verifyRefreshToken } = require("../utils/generateToken");
const redisClient = require("../config/redis.config");
const cloudinary = require("../config/cloudinary.config");
const { z } = require("zod");
const {
    BadRequestError,
    UnauthorizedError,
    NotFoundError,
    ConflictError,
} = require("../utils/appError");

const toUserResponse = (u) => ({
    id: u._id,
    email: u.email,
    username: u.username,
    role: u.role,
    avatar: u.profile?.avatar?.url || null, // avatar is stored as { url, publicId }
});

const REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

// Creates a user, turning MongoDB duplicate-key errors into a 409 with a readable message
async function createUserOrConflict(userData) {
    try {
        return await user.create(userData);
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || "account";
            throw new ConflictError(`An account with this ${field} already exists`);
        }
        throw error;
    }
}

class AuthService {
    async register(payload) {
        const validation = userValidation.safeParse(payload);
        if (!validation.success) {
            throw new BadRequestError("Invalid request body", validation.error.issues);
        }

        const { confirmPassword, ...userData } = validation.data;
        userData.role = "user"; // never take role from the request
        userData.isVerified = false;
        userData.password = await hashPassword(userData.password);

        const newUser = await createUserOrConflict(userData);

        const { token, refreshToken } = generateToken({
            id: newUser._id,
            email: newUser.email,
            username: newUser.username,
            role: newUser.role,
        });

        await redisClient.set(`refreshToken:${newUser._id}`, refreshToken, {
            EX: REFRESH_TOKEN_EXPIRY,
        });

        return {
            user: toUserResponse(newUser),
            accessToken: token,
            refreshToken,
        };
    }

    // identifier can be an email or a username
    async login(payload) {
        const validation = loginValidation.safeParse(payload);
        if (!validation.success) {
            throw new BadRequestError("Invalid request body", validation.error.issues);
        }
        const { identifier, password } = validation.data;

        const emailResult = z.string().email().safeParse(identifier);

        let existingUser;
        if (emailResult.success) {
            existingUser = await user.findOne({ email: identifier });
        } else {
            existingUser = await user.findOne({ username: identifier });
        }

        if (!existingUser) {
            throw new BadRequestError("Invalid Credentials");
        }

        const passwordMatch = await comparePasswords(password, existingUser.password);
        if (!passwordMatch) {
            throw new BadRequestError("Invalid Credentials");
        }

        const { token, refreshToken } = generateToken({
            id: existingUser._id,
            email: existingUser.email,
            username: existingUser.username,
            role: existingUser.role,
        });

        await redisClient.set(`refreshToken:${existingUser._id}`, refreshToken, {
            EX: REFRESH_TOKEN_EXPIRY,
        });

        return {
            user: toUserResponse(existingUser),
            accessToken: token,
            refreshToken,
        };
    }

    // blacklists the access token until it expires and drops the refresh token
    async logout({ token, userPayload }) {
        if (userPayload && userPayload.exp) {
            const remainingTimeInSeconds = Math.floor(userPayload.exp - Date.now() / 1000);
            if (remainingTimeInSeconds > 0) {
                await redisClient.set(`blacklist:${token}`, "true", {
                    EX: remainingTimeInSeconds,
                });
            }
        }

        if (userPayload && userPayload.id) {
            await redisClient.del(`refreshToken:${userPayload.id}`);
        }
    }

    // refresh token rotation: every refresh issues a new pair and replaces the stored refresh token
    async refreshTokens(incomingRefreshToken) {
        if (!incomingRefreshToken) {
            throw new UnauthorizedError("Refresh token missing");
        }

        let decoded;
        try {
            decoded = verifyRefreshToken(incomingRefreshToken);
        } catch (err) {
            throw new UnauthorizedError("Invalid or expired refresh token");
        }

        const storedRefreshToken = await redisClient.get(`refreshToken:${decoded.id}`);
        if (!storedRefreshToken || storedRefreshToken !== incomingRefreshToken) {
            throw new UnauthorizedError("Refresh token revoked or invalid");
        }

        const existingUser = await user.findById(decoded.id);
        if (!existingUser) {
            throw new NotFoundError("User not found");
        }

        const { token: newAccessToken, refreshToken: newRefreshToken } = generateToken({
            id: existingUser._id,
            email: existingUser.email,
            username: existingUser.username,
            role: existingUser.role,
        });

        await redisClient.set(`refreshToken:${existingUser._id}`, newRefreshToken, {
            EX: REFRESH_TOKEN_EXPIRY,
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: toUserResponse(existingUser),
        };
    }

    async registerAdmin(payload) {
        const validation = userValidation.safeParse(payload);
        if (!validation.success) {
            throw new BadRequestError("Invalid request body", validation.error.issues);
        }

        const { confirmPassword, ...userData } = validation.data;
        userData.role = "admin";
        userData.password = await hashPassword(userData.password);

        const newAdmin = await createUserOrConflict(userData);

        return {
            id: newAdmin._id,
            email: newAdmin.email,
            username: newAdmin.username,
            role: newAdmin.role,
        };
    }

    // also removes the user's submissions, avatar and tokens
    async deleteUserProfile({ userId, token, userPayload }) {
        const deletedUser = await user.findByIdAndDelete(userId);
        if (!deletedUser) {
            throw new NotFoundError("User not found");
        }

        await Submission.deleteMany({ userId });

        // a Cloudinary failure shouldn't block account deletion
        const avatarPublicId = deletedUser.profile?.avatar?.publicId;
        if (avatarPublicId) {
            await cloudinary.uploader
                .destroy(avatarPublicId, { invalidate: true })
                .catch((error) => console.error("Could not delete avatar from Cloudinary:", error.message));
        }

        if (token && userPayload && userPayload.exp) {
            const remainingTimeInSeconds = Math.floor(userPayload.exp - Date.now() / 1000);
            if (remainingTimeInSeconds > 0) {
                await redisClient.set(`blacklist:${token}`, "true", {
                    EX: remainingTimeInSeconds,
                });
            }
        }

        await redisClient.del(`refreshToken:${userId}`);

        return {
            id: deletedUser._id,
            email: deletedUser.email,
            username: deletedUser.username,
        };
    }
}

module.exports = new AuthService();
