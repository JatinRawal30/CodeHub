const express = require("express");
const { registerUser, login, logout, refreshAccessToken, adminRegister, deleteProfile } = require("../controllers/userAuth.controller");
const { authMiddleware, adminAuthMiddleware } = require("../middleware/auth.middleware");
const { loginLimiter, registerLimiter, refreshLimiter } = require("../middleware/rateLimiter.middleware");


const authRoute = express.Router();

authRoute.post("/register", registerLimiter, registerUser);
authRoute.post("/login", loginLimiter, login);
authRoute.post("/logout", authMiddleware, logout);
authRoute.post("/refresh", refreshLimiter, refreshAccessToken);
authRoute.post("/admin/register", adminAuthMiddleware, adminRegister);

// 2. Add the delete route:
authRoute.delete("/profile", authMiddleware, deleteProfile);

module.exports = authRoute;