const redisClient = require('../config/redis.config');

/**
 * Factory function to create route-specific rate limiters using Redis
 * @param {Object} options
 * @param {string} options.prefix - Redis key prefix (e.g. 'run', 'submit')
 * @param {number} options.limit - Max allowed requests in the time window (e.g. 3)
 * @param {number} options.windowSeconds - Time window in seconds (e.g. 60)
 * @param {string} options.actionName - Human-readable action name for error messages
 */
function createRateLimiter({ prefix, limit = 3, windowSeconds = 60, actionName = "requests" }) {
    return async function rateLimiterMiddleware(req, res, next) {
        try {
            // Identify user by JWT userId; fallback to IP if not logged in
            const identifier = req.user?.id || req.ip;
            const key = `ratelimit:${prefix}:${identifier}`;

            // Increment request counter atomically
            const currentCount = await redisClient.incr(key);

            // On the first request in this window, set the expiration TTL
            if (currentCount === 1) {
                await redisClient.expire(key, windowSeconds);
            }

            // Get remaining TTL to inform the client
            const ttl = await redisClient.ttl(key);

            // Set standard rate limiting HTTP headers
            res.setHeader('X-RateLimit-Limit', limit);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - currentCount));
            res.setHeader('X-RateLimit-Reset', ttl > 0 ? ttl : windowSeconds);

            // If limit exceeded, block request with 429
            if (currentCount > limit) {
                res.setHeader('Retry-After', ttl > 0 ? ttl : windowSeconds);
                const windowText = windowSeconds % 60 === 0
                    ? `${windowSeconds / 60} minute${windowSeconds === 60 ? "" : "s"}`
                    : `${windowSeconds} seconds`;
                return res.status(429).json({
                    error: `Too many ${actionName}. You can only perform ${limit} ${actionName} per ${windowText}. Please try again in ${ttl} seconds.`,
                    retryAfter: ttl,
                });
            }

            next();
        } catch (error) {
            // If Redis is temporarily down, fail open so users aren't blocked
            console.error("Rate limiter error:", error);
            next();
        }
    };
}

// Pre-configured limiters for 3 requests / 60 seconds
const runCodeLimiter = createRateLimiter({
    prefix: 'run',
    limit: 3,
    windowSeconds: 60,
    actionName: 'code runs',
});

const submitCodeLimiter = createRateLimiter({
    prefix: 'submit',
    limit: 3,
    windowSeconds: 60,
    actionName: 'code submissions',
});

// send-verify-email rate limiter: 10 requests per 15 minutes
const sendVerifyEmailLimiter = createRateLimiter({
    prefix: 'verify-email-send',
    limit: 10,
    windowSeconds: 15 * 60,
    actionName: 'verification email requests',
});

// verify-email rate limiter: 5 requests per 15 minutes
const verifyEmailLimiter = createRateLimiter({
    prefix: 'verify-email-check',
    limit: 5,
    windowSeconds: 15 * 60,
    actionName: 'verification attempts',
});

// login rate limiter: 10 attempts per 15 minutes per IP (brute-force protection)
const loginLimiter = createRateLimiter({
    prefix: 'login',
    limit: 10,
    windowSeconds: 15 * 60,
    actionName: 'login attempts',
});

// register rate limiter: 5 sign-ups per hour per IP
const registerLimiter = createRateLimiter({
    prefix: 'register',
    limit: 5,
    windowSeconds: 60 * 60,
    actionName: 'registrations',
});

// refresh rate limiter: 60 refreshes per 15 minutes per IP (every page load uses one)
const refreshLimiter = createRateLimiter({
    prefix: 'refresh',
    limit: 60,
    windowSeconds: 15 * 60,
    actionName: 'token refreshes',
});

// ratelimiter for upload/change avatar(profile photo)
const avatarUploadLimiter = createRateLimiter({
    prefix: 'avatar-upload', limit: 10, windowSeconds: 60 * 60, actionName: 'avatar uploads',
});


module.exports = {
    createRateLimiter,
    loginLimiter,
    registerLimiter,
    refreshLimiter,
    runCodeLimiter,
    submitCodeLimiter,
    sendVerifyEmailLimiter,
    verifyEmailLimiter,
    avatarUploadLimiter,
};
