// Connection options for BullMQ (uses ioredis under the hood, separate from the
// node-redis client in redis.config.js). Same Redis Cloud database.
const bullConnection = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: "default",
    password: process.env.REDIS_KEY,
    maxRetriesPerRequest: null, // required by BullMQ workers
};

module.exports = { bullConnection };
