const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const {
    sendVerificationOtpHandler,
    verifyEmailHandler,
} = require("../controllers/emailVerification.controller");
const {
    getMyProfile,
    getPublicProfile,
    searchUsers,
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
} = require("../middleware/rateLimiter.middleware");

const userRouter = express.Router();

userRouter.post('/send-verify-email', authMiddleware, sendVerifyEmailLimiter, sendVerificationOtpHandler);
userRouter.post('/verify-email',      authMiddleware, verifyEmailLimiter, verifyEmailHandler);

userRouter.get('/profile', authMiddleware, getMyProfile);
userRouter.put('/profile', authMiddleware, updateMyProfile);
userRouter.patch('/profile/change-password',authMiddleware,changePassword);
userRouter.post('/avatar/signature', authMiddleware, avatarUploadLimiter, getAvatarSignature);
userRouter.put('/avatar', authMiddleware, saveAvatar);
userRouter.delete('/avatar', authMiddleware, removeAvatar);
userRouter.get('/search', authMiddleware, userSearchLimiter, searchUsers);

// Public, no auth. Keep last so /profile, /avatar etc. aren't caught as :username
userRouter.get('/:username', getPublicProfile);

module.exports = userRouter;
