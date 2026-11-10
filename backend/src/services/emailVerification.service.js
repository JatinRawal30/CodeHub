const crypto = require('crypto');
const redisClient = require('../config/redis.config');
const { user } = require('../models/user');
const { BadRequestError, NotFoundError } = require('../utils/appError');
const { hashPassword, comparePasswords } = require('../utils/hashing');
const { resetPasswordValidation } = require('../utils/validateReqBody');
const { sendEmail, getOtpEmailHtml } = require('../utils/sendEmail');

const OTP_TTL_SECONDS = 600;
const RESEND_COOLDOWN_SECONDS = 60;
// wrong guesses allowed per code; /reset-password is public, so the per-IP limiter alone isn't enough
const MAX_OTP_ATTEMPTS = 5;

const PURPOSES = {
    verifyEmail: {
        key: 'email_otp',
        subject: 'Your CodeHub Email Verification Code',
        heading: 'Email Verification Code',
        action: 'verify your CodeHub email address',
    },
    resetPassword: {
        key: 'reset_otp',
        subject: 'Your CodeHub Password Reset Code',
        heading: 'Password Reset Code',
        action: 'reset your CodeHub password',
    },
};

const otpKey = (purpose, userId) => `${PURPOSES[purpose].key}:${userId}`;
const cooldownKey = (purpose, userId) => `${PURPOSES[purpose].key}_cooldown:${userId}`;
const attemptsKey = (purpose, userId) => `${PURPOSES[purpose].key}_attempts:${userId}`;

async function issueOtp(purpose, targetUser) {
    const userId = targetUser._id.toString();

    if (await redisClient.get(cooldownKey(purpose, userId))) {
        throw new BadRequestError(`Please wait ${RESEND_COOLDOWN_SECONDS} seconds before requesting another code`);
    }

    // upper bound is exclusive
    const otp = crypto.randomInt(100000, 1000000).toString();
    const { subject, heading, action } = PURPOSES[purpose];

    await redisClient.set(otpKey(purpose, userId), otp, { EX: OTP_TTL_SECONDS });
    await redisClient.del(attemptsKey(purpose, userId));
    await redisClient.set(cooldownKey(purpose, userId), "true", { EX: RESEND_COOLDOWN_SECONDS });

    // without RESEND_EMAIL_KEY this just logs to the console
    await sendEmail({
        to: targetUser.email,
        subject,
        text: `Hello ${targetUser.username},\n\nUse this code to ${action}: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this code, please ignore this email.`,
        html: getOtpEmailHtml(otp, targetUser.username, { heading, action }),
    });
}

// throws unless incomingOtp matches; the code is burned after MAX_OTP_ATTEMPTS misses
async function checkOtp(purpose, userId, incomingOtp) {
    const storedOtp = await redisClient.get(otpKey(purpose, userId));
    if (!storedOtp) {
        throw new BadRequestError("Code has expired or was not requested");
    }

    if (storedOtp !== String(incomingOtp).trim()) {
        const attempts = await redisClient.incr(attemptsKey(purpose, userId));
        if (attempts === 1) {
            await redisClient.expire(attemptsKey(purpose, userId), OTP_TTL_SECONDS);
        }
        if (attempts >= MAX_OTP_ATTEMPTS) {
            await clearOtp(purpose, userId);
            throw new BadRequestError("Too many wrong attempts. Please request a new code");
        }
        throw new BadRequestError("Invalid code");
    }
}

async function clearOtp(purpose, userId) {
    await redisClient.del([
        otpKey(purpose, userId),
        attemptsKey(purpose, userId),
        cooldownKey(purpose, userId),
    ]);
}

async function sendVerificationOtp(userId) {
    const existingUser = await user.findById(userId);
    if (!existingUser) {
        throw new NotFoundError("User not found");
    }

    if (existingUser.isVerified) {
        throw new BadRequestError("Email is already verified");
    }

    await issueOtp('verifyEmail', existingUser);

    return {
        message: "Verification code sent to your email",
        expiresInSeconds: OTP_TTL_SECONDS,
    };
}

async function verifyEmailOtp(userId, incomingOtp) {
    if (!incomingOtp) {
        throw new BadRequestError("Verification code is required");
    }

    const existingUser = await user.findById(userId);
    if (!existingUser) {
        throw new NotFoundError("User not found");
    }

    if (existingUser.isVerified) {
        throw new BadRequestError("Email is already verified");
    }

    await checkOtp('verifyEmail', userId, incomingOtp);

    existingUser.isVerified = true;
    await existingUser.save();
    await clearOtp('verifyEmail', userId);

    return {
        message: "Email verified successfully! Your account is now fully active.",
        isVerified: true,
    };
}

// same response whether or not the email exists, so this can't be used to find accounts
async function sendPasswordResetOtp(email) {
    if (!email || typeof email !== 'string') {
        throw new BadRequestError("Email is required");
    }

    const response = {
        message: "If an account exists for that email, a reset code has been sent",
        expiresInSeconds: OTP_TTL_SECONDS,
    };

    const existingUser = await user.findOne({ email: email.trim().toLowerCase() });
    if (!existingUser || !existingUser.isActive) {
        return response;
    }

    // a "please wait" error here would also give away that the account exists
    if (await redisClient.get(cooldownKey('resetPassword', existingUser._id.toString()))) {
        return response;
    }

    await issueOtp('resetPassword', existingUser);
    return response;
}

async function resetPassword(body) {
    const validation = resetPasswordValidation.safeParse(body);
    if (!validation.success) {
        throw new BadRequestError("Invalid request body", validation.error.issues);
    }
    const { email, otp, newPassword } = validation.data;

    const existingUser = await user.findOne({ email }).select("+password");
    // same error as a wrong code, so this can't be used to find accounts either
    if (!existingUser || !existingUser.isActive) {
        throw new BadRequestError("Code has expired or was not requested");
    }
    const userId = existingUser._id.toString();

    await checkOtp('resetPassword', userId, otp);

    if (await comparePasswords(newPassword, existingUser.password)) {
        throw new BadRequestError("New password must be different from the old password");
    }

    existingUser.password = await hashPassword(newPassword);
    // they just proved they own the inbox
    existingUser.isVerified = true;
    await existingUser.save();

    await clearOtp('resetPassword', userId);
    // log out every session; access tokens still live until they expire
    await redisClient.del(`refreshToken:${userId}`);

    return { message: "Password reset successfully. Please sign in with your new password." };
}

module.exports = {
    sendVerificationOtp,
    verifyEmailOtp,
    sendPasswordResetOtp,
    resetPassword,
};
