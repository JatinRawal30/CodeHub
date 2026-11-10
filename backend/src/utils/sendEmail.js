const { Resend } = require("resend");

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// EMAIL_PROVIDER picks the service; each one needs its own API key
const PROVIDERS = {
    brevo: { keyName: "BREVO_API_KEY", send: sendWithBrevo },
    resend: { keyName: "RESEND_EMAIL_KEY", send: sendWithResend },
};

// "CodeHub <you@gmail.com>" -> { name: "CodeHub", email: "you@gmail.com" }
function parseSender(from) {
    const match = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(from);
    return match ? { name: match[1] || "CodeHub", email: match[2] } : { name: "CodeHub", email: from.trim() };
}

async function sendWithBrevo({ to, subject, html, text }, apiKey) {
    // Brevo only sends from an address verified in its dashboard, so there's no safe default
    if (!process.env.EMAIL_FROM) {
        throw new Error("EMAIL_FROM must be set to a sender verified in Brevo");
    }

    const response = await fetch(BREVO_API_URL, {
        method: "POST",
        headers: {
            "api-key": apiKey,
            "content-type": "application/json",
            accept: "application/json",
        },
        body: JSON.stringify({
            sender: parseSender(process.env.EMAIL_FROM),
            to: [{ email: to }],
            subject,
            htmlContent: html,
            textContent: text,
        }),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(`Failed to send email: ${body.message || response.statusText} (${response.status})`);
    }

    return { id: body.messageId };
}

let resendClient;
async function sendWithResend({ to, subject, html, text }, apiKey) {
    resendClient ??= new Resend(apiKey);

    // Resend returns { data, error } instead of throwing on API errors
    const { data, error } = await resendClient.emails.send({
        from: process.env.EMAIL_FROM || "CodeHub <onboarding@resend.dev>",
        to,
        subject,
        text,
        html,
    });

    if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
}

async function sendEmail({ to, subject, html, text }) {
    const providerName = (process.env.EMAIL_PROVIDER || "brevo").toLowerCase();
    const provider = PROVIDERS[providerName];
    if (!provider) {
        throw new Error(`Unknown EMAIL_PROVIDER "${providerName}", expected one of: ${Object.keys(PROVIDERS).join(", ")}`);
    }

    const apiKey = process.env[provider.keyName];

    if (!apiKey) {
        console.log(`\n======================================================`);
        console.log(`📧 [MOCK EMAIL] To: ${to}`);
        console.log(`📌 Subject: ${subject}`);
        console.log(`📝 Content: ${text || html}`);
        console.log(`💡 Set ${provider.keyName} in .env to deliver real emails via ${providerName}.`);
        console.log(`======================================================\n`);
        return { id: "mock-message-id" };
    }

    return provider.send({ to, subject, html, text }, apiKey);
}

function getOtpEmailHtml(otp, username = "Developer", {
    heading = "Email Verification Code",
    action = "verify your CodeHub email address",
} = {}) {
    return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="color: #38bdf8; font-size: 26px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">CodeHub</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">${heading}</p>
        </div>
        <div style="background-color: #1e293b; padding: 24px; border-radius: 8px; border: 1px solid #334155;">
            <p style="margin-top: 0; font-size: 15px; color: #e2e8f0;">Hello <strong>${username}</strong>,</p>
            <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">Use the code below to ${action}. This code is valid for <strong>10 minutes</strong>.</p>
            <div style="text-align: center; margin: 28px 0;">
                <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; background-color: #0f172a; padding: 14px 28px; border-radius: 8px; border: 1px dashed #38bdf8;">
                    ${otp}
                </span>
            </div>
            <p style="font-size: 13px; color: #64748b; margin-bottom: 0; line-height: 1.5;">If you did not request this code, please ignore this email or contact support if you have concerns.</p>
        </div>
        <p style="text-align: center; font-size: 12px; color: #475569; margin-top: 24px;">&copy; ${new Date().getFullYear()} CodeHub Platform. All rights reserved.</p>
    </div>
    `;
}

module.exports = {
    sendEmail,
    getOtpEmailHtml,
};
