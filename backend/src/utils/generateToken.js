require('dotenv').config();
const jwt = require('jsonwebtoken');

const getJwtKey = () => process.env.JWT_KEY || process.env.JWT_SECRET ;
const getRefreshKey = () => process.env.REFRESH_KEY || process.env.REFRESH_TOKEN_SECRET;

const generateToken = function (payload) {
    const token = jwt.sign(payload, getJwtKey(), { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, getRefreshKey(), { expiresIn: '7d' });
    return { token, refreshToken };
};

const verifyToken = function (token) {
    try {
        return jwt.verify(token, getJwtKey());
    } catch (error) {
        throw new Error('Invalid token');
    }
};

const verifyRefreshToken = function (token) {
    try {
        return jwt.verify(token, getRefreshKey());
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

module.exports = {
    generateToken,
    verifyToken,
    verifyRefreshToken,
};