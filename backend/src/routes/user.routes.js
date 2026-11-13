const express = require("express");
const { authMiddleware, blockDemoAccount } = require("../middleware/auth.middleware");
const {
    sendVerificationOtpHandler,
    verifyEmailHandler,
} = require("../controllers/emailVerification.controller");
const {
    getMyProfile,
    getPublicProfile,
    searchUsers,
    getLeaderboard,
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
    userSearchLimiter,
    leaderboardLimiter,
} = require("../middleware/rateLimiter.middleware");

const userRouter = express.Router();

userRouter.post('/send-verify-email', authMiddleware, blockDemoAccount, sendVerifyEmailLimiter, sendVerificationOtpHandler);
userRouter.post('/verify-email',      authMiddleware, blockDemoAccount, verifyEmailLimiter, verifyEmailHandler);

userRouter.get('/profile', authMiddleware, getMyProfile);
userRouter.put('/profile', authMiddleware, blockDemoAccount, updateMyProfile);
userRouter.patch('/profile/change-password',authMiddleware, blockDemoAccount,changePassword);
userRouter.post('/avatar/signature', authMiddleware, blockDemoAccount, avatarUploadLimiter, getAvatarSignature);
userRouter.put('/avatar', authMiddleware, blockDemoAccount, saveAvatar);
userRouter.delete('/avatar', authMiddleware, blockDemoAccount, removeAvatar);
userRouter.get('/search', authMiddleware, userSearchLimiter, searchUsers);
userRouter.get('/leaderboard', authMiddleware, leaderboardLimiter, getLeaderboard);

// Public, no auth. Keep last so /profile, /avatar etc. aren't caught as :username
userRouter.get('/:username', getPublicProfile);

module.exports = userRouter;
