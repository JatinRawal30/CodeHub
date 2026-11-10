const redisClient = require('../config/redis.config');

// Fixed-window limiter backed by Redis INCR + EXPIRE. windowSeconds is in seconds.
function createRateLimiter({ prefix, limit = 3, windowSeconds = 60, actionName = "requests" }) {
    return async function rateLimiterMiddleware(req, res, next) {
        try {
            // per user when authenticated, otherwise per IP
            const identifier = req.user?.id || req.ip;
            const key = `ratelimit:${prefix}:${identifier}`;

            const currentCount = await redisClient.incr(key);

            // first hit opens the window
            if (currentCount === 1) {
                await redisClient.expire(key, windowSeconds);
            }

            const ttl = await redisClient.ttl(key);

            res.setHeader('X-RateLimit-Limit', limit);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - currentCount));
            res.setHeader('X-RateLimit-Reset', ttl > 0 ? ttl : windowSeconds);

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
            // fail open if Redis is down rather than locking everyone out
            console.error("Rate limiter error:", error);
            next();
        }
    };
}

// 3 per minute
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

// 10 per 15 min
const sendVerifyEmailLimiter = createRateLimiter({
    prefix: 'verify-email-send',
    limit: 10,
    windowSeconds: 15 * 60,
    actionName: 'verification email requests',
});

// 5 OTP guesses per 15 min
const verifyEmailLimiter = createRateLimiter({
    prefix: 'verify-email-check',
    limit: 5,
    windowSeconds: 15 * 60,
    actionName: 'verification attempts',
});

// per IP, 10 per 15 min to slow down brute forcing
const loginLimiter = createRateLimiter({
    prefix: 'login',
    limit: 10,
    windowSeconds: 15 * 60,
    actionName: 'login attempts',
});

// per IP, 5 per hour
const registerLimiter = createRateLimiter({
    prefix: 'register',
    limit: 5,
    windowSeconds: 60 * 60,
    actionName: 'registrations',
});

// high limit because every page load does a refresh
const refreshLimiter = createRateLimiter({
    prefix: 'refresh',
    limit: 60,
    windowSeconds: 15 * 60,
    actionName: 'token refreshes',
});

// per IP, 5 per 15 min
const forgotPasswordLimiter = createRateLimiter({
    prefix: 'forgot-password',
    limit: 5,
    windowSeconds: 15 * 60,
    actionName: 'password reset requests',
});

// per IP; each code also burns itself after 5 misses
const resetPasswordLimiter = createRateLimiter({
    prefix: 'reset-password',
    limit: 10,
    windowSeconds: 15 * 60,
    actionName: 'password reset attempts',
});

// 10 per hour
const avatarUploadLimiter = createRateLimiter({
    prefix: 'avatar-upload', limit: 10, windowSeconds: 60 * 60, actionName: 'avatar uploads',
});

// search-as-you-type is debounced client-side; 60 per minute per user
const userSearchLimiter = createRateLimiter({
    prefix: 'user-search', limit: 60, windowSeconds: 60, actionName: 'searches',
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
    userSearchLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter,
};
