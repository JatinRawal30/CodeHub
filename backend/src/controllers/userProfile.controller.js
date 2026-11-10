const userService = require("../services/user.service");

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false, // set to true in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

async function getMyProfile(req, res) {
    try {
        const profile = await userService.getMyProfile(req.user.id);
        return res.status(200).json({ profile });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

// public, no auth
async function getPublicProfile(req, res) {
    try {
        const { username } = req.params;
        const profile = await userService.getPublicProfile(username);
        return res.status(200).json({ profile });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

async function searchUsers(req, res) {
    try {
        const users = await userService.searchUsers(req.query.q);
        return res.status(200).json({ users });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

async function updateMyProfile(req, res) {
    try {
        const updatedProfile = await userService.updateMyProfile(req.user.id, req.body);
        return res.status(200).json({
            message: "Profile updated successfully",
            profile: updatedProfile,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            error: error.message,
            ...(error.details && { details: error.details }),
        });
    }
}

async function changePassword(req, res) {
    try {
        const { accessToken, refreshToken } = await userService.changePassword(req.user.id, req.body);

        // Swap in the new refresh cookie so this device stays logged in;
        // every other session is invalidated by the password change
        res.clearCookie("refreshToken", { httpOnly: true, secure: false, sameSite: "strict" });
        res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

        return res.status(200).json({
            message: "Password changed successfully. All other sessions have been invalidated.",
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

module.exports = {
    getMyProfile,
    getPublicProfile,
    searchUsers,
    updateMyProfile,
    changePassword
};
