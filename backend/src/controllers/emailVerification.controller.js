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

async function forgotPasswordHandler(req, res) {
    try {
        const result = await emailService.sendPasswordResetOtp(req.body?.email);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

async function resetPasswordHandler(req, res) {
    try {
        const result = await emailService.resetPassword(req.body);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            error: error.message,
            ...(error.details && { details: error.details }),
        });
    }
}


module.exports = {
    sendVerificationOtpHandler,
    verifyEmailHandler,
    forgotPasswordHandler,
    resetPasswordHandler,
};