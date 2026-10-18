const authService = require("../services/auth.service");

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false, // set to true in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// Register or Signup User
async function registerUser(req, res) {
    try {
        const { accessToken, refreshToken } = await authService.register(req.body);

        res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

        return res.status(201).json({
            accessToken,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            error: error.message,
            ...(error.details && { details: error.details }),
        });
    }
}

// Login
async function login(req, res) {
    try {
        const { identifier, password } = req.body;
        const { user, accessToken, refreshToken } = await authService.login({ identifier, password });

        res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

        return res.status(200).json({
            accessToken,
            user,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message,
            ...(error.details && { details: error.details }),
        });
    }
}

// Logout
async function logout(req, res) {
    try {
        await authService.logout({
            token: req.token,
            userPayload: req.user,
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
        });

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

// Refresh access and refresh token
async function refreshAccessToken(req, res) {
    try {
        const incomingRefreshToken = req.cookies.refreshToken;
        const { user, accessToken, refreshToken } = await authService.refreshTokens(incomingRefreshToken);

        res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

        return res.status(200).json({
            accessToken,
            user,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message,
            error: error.message,
        });
    }
}

// Admin register
async function adminRegister(req, res) {
    try {
        const admin = await authService.registerAdmin(req.body);

        return res.status(201).json({
            message: "Admin registered successfully. Please login to proceed.",
            admin,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            error: error.message,
            ...(error.details && { details: error.details }),
        });
    }
}

// Delete user profile
async function deleteProfile(req, res) {
    try {
        const deletedUser = await authService.deleteUserProfile({
            userId: req.user.id,
            token: req.token,
            userPayload: req.user,
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
        });

        return res.status(200).json({
            message: "User profile and all associated data deleted successfully",
            deletedUser,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

module.exports = {
    registerUser,
    login,
    logout,
    refreshAccessToken,
    adminRegister,
    deleteProfile,
};