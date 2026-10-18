const nodemailer = require("nodemailer");

/**
 * Creates the Nodemailer transporter.
 * If EMAIL_USER and EMAIL_PASS are configured in .env, uses Gmail/SMTP.
 * Otherwise, gracefully logs to console in development.
 */
const createTransporter = () => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "gmail",
        auth: {
            user,
            pass,
        },
    });
};

/**
 * Sends an email with both HTML and plaintext versions
 */
async function sendEmail({ to, subject, html, text }) {
    const transporter = createTransporter();

    if (!transporter) {
        console.log(`\n======================================================`);
        console.log(`📧 [MOCK EMAIL] To: ${to}`);
        console.log(`📌 Subject: ${subject}`);
        console.log(`📝 Content: ${text || html}`);
        console.log(`💡 Set EMAIL_USER & EMAIL_PASS in .env to deliver real emails.`);
        console.log(`======================================================\n`);
        return { messageId: "mock-message-id" };
    }

    const mailOptions = {
        from: process.env.EMAIL_FROM || `"CodeHub" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
    };

    return await transporter.sendMail(mailOptions);
}

/**
 * Helper to generate a clean, responsive HTML verification email
 */
function getVerificationEmailHtml(otp, username = "Developer") {
    return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="color: #38bdf8; font-size: 26px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">CodeHub</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">Email Verification Code</p>
        </div>
        <div style="background-color: #1e293b; padding: 24px; border-radius: 8px; border: 1px solid #334155;">
            <p style="margin-top: 0; font-size: 15px; color: #e2e8f0;">Hello <strong>${username}</strong>,</p>
            <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">Use the verification code below to verify your CodeHub email address. This code is valid for <strong>10 minutes</strong>.</p>
            <div style="text-align: center; margin: 28px 0;">
                <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; background-color: #0f172a; padding: 14px 28px; border-radius: 8px; border: 1px dashed #38bdf8;">
                    ${otp}
                </span>
            </div>
            <p style="font-size: 13px; color: #64748b; margin-bottom: 0; line-height: 1.5;">If you did not request this verification code, please ignore this email or contact support if you have concerns.</p>
        </div>
        <p style="text-align: center; font-size: 12px; color: #475569; margin-top: 24px;">&copy; ${new Date().getFullYear()} CodeHub Platform. All rights reserved.</p>
    </div>
    `;
}

module.exports = {
    sendEmail,
    getVerificationEmailHtml,
};
