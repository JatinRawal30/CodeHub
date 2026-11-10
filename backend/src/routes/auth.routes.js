const express = require("express");
const { registerUser, login, logout, refreshAccessToken, adminRegister, deleteProfile } = require("../controllers/userAuth.controller");
const { authMiddleware, adminAuthMiddleware } = require("../middleware/auth.middleware");
const { forgotPasswordHandler, resetPasswordHandler } = require("../controllers/emailVerification.controller");
const { loginLimiter, registerLimiter, refreshLimiter, forgotPasswordLimiter, resetPasswordLimiter } = require("../middleware/rateLimiter.middleware");


const authRoute = express.Router();

authRoute.post("/register", registerLimiter, registerUser);
authRoute.post("/login", loginLimiter, login);
authRoute.post("/logout", authMiddleware, logout);
authRoute.post("/refresh", refreshLimiter, refreshAccessToken);
authRoute.post("/forgot-password", forgotPasswordLimiter, forgotPasswordHandler);
authRoute.post("/reset-password", resetPasswordLimiter, resetPasswordHandler);
authRoute.post("/admin/register", adminAuthMiddleware, adminRegister);

authRoute.delete("/profile", authMiddleware, deleteProfile);

module.exports = authRoute;