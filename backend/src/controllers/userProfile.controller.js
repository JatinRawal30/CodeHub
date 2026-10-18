const userService = require("../services/user.service");

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false, // set to true in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// GET /api/user/profile — Full private profile for the logged-in user
async function getMyProfile(req, res) {
    try {
        const profile = await userService.getMyProfile(req.user.id);
        return res.status(200).json({ profile });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

// GET /api/user/:username — Public profile (anyone can view)
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

// PUT /api/user/profile — Update the logged-in user's own profile
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

//change password in profile section.
async function changePassword(req, res) {
    try {
        const { accessToken, refreshToken } = await userService.changePassword(req.user.id, req.body);

        // Clear the old refresh token cookie, then set the new one
        // This keeps the current device logged in while invalidating all other sessions
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
    updateMyProfile,
    changePassword
};
