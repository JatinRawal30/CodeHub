const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const {
    sendVerificationOtpHandler,
    verifyEmailHandler,
} = require("../controllers/emailVerification.controller");
const {
    getMyProfile,
    getPublicProfile,
    updateMyProfile,
    changePassword,
} = require("../controllers/userProfile.controller");
const {
    getAvatarSignature,
    saveAvatar,
    removeAvatar,
} = require("../controllers/avatar.controller");
const {
    sendVerifyEmailLimiter,
    verifyEmailLimiter,
    avatarUploadLimiter,
} = require("../middleware/rateLimiter.middleware");

const userRouter = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL VERIFICATION (one-time, authenticated)
// ─────────────────────────────────────────────────────────────────────────────
userRouter.post('/send-verify-email', authMiddleware, sendVerifyEmailLimiter, sendVerificationOtpHandler);
userRouter.post('/verify-email',      authMiddleware, verifyEmailLimiter,     verifyEmailHandler);

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE PROFILE (owner only — requires auth)
// ─────────────────────────────────────────────────────────────────────────────
// GET  /api/user/profile  → full private profile + email + account settings
// PUT  /api/user/profile  → update bio, name, languagePreferences (avatar has its own routes below)
userRouter.get('/profile', authMiddleware, getMyProfile);
userRouter.put('/profile', authMiddleware, updateMyProfile);
userRouter.patch('/profile/change-password',authMiddleware,changePassword);
userRouter.post('/avatar/signature', authMiddleware, avatarUploadLimiter, getAvatarSignature);
userRouter.put('/avatar', authMiddleware, saveAvatar);
userRouter.delete('/avatar', authMiddleware, removeAvatar);

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC PROFILE (by username — no auth required, like LeetCode)
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/user/:username → public stats, solved breakdown, activity
// NOTE: must be LAST to avoid matching /profile or /send-verify-email as :username
userRouter.get('/:username', getPublicProfile);

module.exports = userRouter;
