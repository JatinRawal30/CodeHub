const { verifyToken } = require("../utils/generateToken");
const redisClient = require("../config/redis.config");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];

        // tokens are blacklisted in Redis on logout
        const isBlacklisted = await redisClient.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ message: "Unauthorized: Token has been revoked" });
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        req.user = decoded;
        req.token = token;

        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: " + error.message });
    }
};

const adminAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];

        // tokens are blacklisted in Redis on logout
        const isBlacklisted = await redisClient.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ message: "Unauthorized: Token has been revoked" });
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if(decoded.role !=='admin'){
            return res.status(403).json({ message: "Forbidden" });
        }

        req.user = decoded;
        req.token = token;

        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: " + error.message });
    }
};

module.exports = {
    authMiddleware,
    adminAuthMiddleware
};