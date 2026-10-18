const emailService = require('../services/emailVerification.service');


async function sendVerificationOtpHandler(req, res) {
    try {
        const result = await emailService.sendVerificationOtp(req.user.id);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

async function verifyEmailHandler(req, res) {
    try {
        const { otp } = req.body;
        const result = await emailService.verifyEmailOtp(req.user.id, otp);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}


module.exports = {
    sendVerificationOtpHandler,
    verifyEmailHandler
};