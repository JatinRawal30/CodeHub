const crypto = require('crypto');
const redisClient = require('../config/redis.config');
const { user } = require('../models/user');
const { BadRequestError, NotFoundError } = require('../utils/appError');
const { sendEmail, getVerificationEmailHtml } = require('../utils/sendEmail');

async function sendVerificationOtp(userId) {
    const existingUser = await user.findById(userId);
    if (!existingUser) {
        throw new NotFoundError("User not found");
    }

    // 1. One-time verification rule: If already verified, do nothing!
    if (existingUser.isVerified) {
        throw new BadRequestError("Email is already verified");
    }

    // 2. Cooldown check: Prevent user from spamming the button
    const cooldownKey = `email_cooldown:${userId}`;
    const inCooldown = await redisClient.get(cooldownKey);
    if (inCooldown) {
        throw new BadRequestError("Please wait 60 seconds before requesting another code");
    }

    // 3. Generate a secure 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // 4. Store OTP in Redis with 10-minute expiry (600 seconds)
    const otpKey = `email_otp:${userId}`;
    await redisClient.set(otpKey, otp, { EX: 600 });

    // 5. Set 60-second cooldown so user cannot spam
    await redisClient.set(cooldownKey, "true", { EX: 60 });

    // 6. Send email via Nodemailer (or graceful console fallback)
    await sendEmail({
        to: existingUser.email,
        subject: "Your CodeHub Email Verification Code",
        text: `Hello ${existingUser.username},\n\nYour CodeHub email verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this code, please ignore this email.`,
        html: getVerificationEmailHtml(otp, existingUser.username),
    });

    return {
        message: "Verification code sent to your email",
        expiresInSeconds: 600,
    };
}


async function verifyEmailOtp(userId, incomingOtp) {
    if (!incomingOtp) {
        throw new BadRequestError("Verification code is required");
    }

    const existingUser = await user.findById(userId);
    if (!existingUser) {
        throw new NotFoundError("User not found");
    }

    // 1. Check if already verified
    if (existingUser.isVerified) {
        throw new BadRequestError("Email is already verified");
    }

    // 2. Fetch OTP from Redis
    const otpKey = `email_otp:${userId}`;
    const storedOtp = await redisClient.get(otpKey);

    if (!storedOtp) {
        throw new BadRequestError("Verification code has expired or was not requested");
    }

    if (storedOtp !== incomingOtp.trim()) {
        throw new BadRequestError("Invalid verification code");
    }

    // 3. One-time update: Mark user as verified in MongoDB
    existingUser.isVerified = true;
    await existingUser.save();

    // 4. Clean up Redis OTP
    await redisClient.del(otpKey);
    await redisClient.del(`email_cooldown:${userId}`);

    return {
        message: "Email verified successfully! Your account is now fully active.",
        isVerified: true,
    };
}


module.exports = {
    sendVerificationOtp,
    verifyEmailOtp
}