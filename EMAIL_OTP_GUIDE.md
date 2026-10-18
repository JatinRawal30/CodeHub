# CodeHub: Email Delivery + Email Verification + Forgot Password (Free)

This guide sets up:

1. **Real email delivery** at ₹0 / $0.
2. **Email verification after signup:** the user signs up, gets a 6-digit code, and enters it.
3. **Forgot password with an email OTP:** enter email, get a code, then set a new password using that code.

It builds on what already exists in the codebase:
- `backend/src/utils/sendEmail.js` (Nodemailer + console "mock email" fallback)
- `backend/src/services/emailVerification.service.js` (OTP in Redis)
- `POST /api/user/send-verify-email` and `POST /api/user/verify-email`
- The "Forgot Password?" link on the login page, which currently goes nowhere.

---

## Part 0: Choosing a free email provider

| Option | Free limit | Needs your own domain? | Works on free hosting? | Verdict |
|---|---|---|---|---|
| **Brevo (HTTP API)** | **300 emails/day**, no expiry | **No**: verify a single sender address (e.g. your Gmail) | ✅ Yes, it's a normal HTTPS request | **Recommended** |
| Gmail SMTP + App Password | ~500/day (personal Gmail) | No | ❌ **Not on Render free**: Render blocks outbound SMTP ports 25/465/587 on free web services (since Sept 2025). Railway also restricts SMTP on free/trial plans | Good for **local development** only |
| Resend (HTTP API) | 100/day, 3,000/month | To send to *other people*, you need to verify a domain (check their docs; without one you can only send test mail to yourself) | ✅ | Great if you buy a domain later |
| Console "mock" | Unlimited | No | ✅ | Already built in: prints the code in the server terminal |

**The plan:**
- **Local development:** the console mock (or Gmail SMTP if you want real emails on your laptop).
- **Deployed:** the **Brevo HTTP API**. It works on any host because it uses HTTPS, not SMTP, and it's free with no domain.

We'll make the provider switchable with one env variable: `EMAIL_PROVIDER=console | smtp | brevo`.

> **Deliverability note:** sending "from" a Gmail address through Brevo works, but some messages may land in **Spam** because you can't add Brevo's authentication records (DKIM) to gmail.com. Brevo may also show the sender as an `@brevosend.com` address. For a resume project that's acceptable; tell testers to check Spam. The real fix is a domain of your own (a few dollars a year, so not free) with Brevo's DNS records added. You can do that later without code changes.

---

## Part 1: Create the Brevo account (10 minutes, one-time)

1. Sign up at **brevo.com** (free plan, no card needed). Complete the profile questions; Brevo may ask for these before it lets you send.
2. **Add and verify a sender:** go to **Settings → Senders, Domains & Dedicated IPs → Senders → Add a sender**.
   - Name: `CodeHub`
   - Email: your Gmail (e.g. `yourname@gmail.com`)
   - Brevo emails that address a code or link. Confirm it.
3. **Create an API key:** **Settings → SMTP & API → API Keys → Generate a new API key** (name it `codehub-backend`). Copy it now, because it's shown only once. It starts with `xkeysib-`.
4. **Authorised IPs (important when deploying):** Brevo can block API calls from IP addresses it doesn't recognise. Free hosts change IPs, so if you see a `401 ... unrecognised IP address` error, go to **Settings → Security → Authorised IPs** and turn off IP blocking (or add your server's IPs).
5. You can see every sent email, and whether it was delivered, under **Transactional → Logs**.

### Optional: Gmail SMTP for local testing
1. Turn on **2-Step Verification** for your Google account.
2. Google Account → Security → **App passwords** → create one called "CodeHub". You get a 16-character password.
3. Use it as `SMTP_PASS` (Part 2). Never use your real Gmail password.

---

## Part 2: Environment variables

Add to `backend/.env` (real values) and `backend/.env.example` (placeholders), replacing the old `EMAIL_USER / EMAIL_PASS / EMAIL_SERVICE / EMAIL_FROM` block:

```bash
# console | smtp | brevo
EMAIL_PROVIDER=console
EMAIL_FROM_NAME=CodeHub
EMAIL_FROM_ADDRESS=yourname@gmail.com      # must be the sender you verified in Brevo

# Brevo (EMAIL_PROVIDER=brevo)
BREVO_API_KEY=xkeysib-...

# SMTP (EMAIL_PROVIDER=smtp), e.g. Gmail with an App Password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=yourname@gmail.com
SMTP_PASS=abcdefghijklmnop
```

On your hosting provider, set `EMAIL_PROVIDER=brevo` plus the Brevo variables.

---

## Part 3: Backend

### 3.1 Rewrite `src/utils/sendEmail.js` with switchable providers

```js
const nodemailer = require("nodemailer");

const from = () => ({
    name: process.env.EMAIL_FROM_NAME || "CodeHub",
    email: process.env.EMAIL_FROM_ADDRESS,
});

// Prints the email instead of sending it (local development)
async function sendWithConsole({ to, subject, text }) {
    console.log(`\n📧 [MOCK EMAIL] To: ${to}\n📌 ${subject}\n${text}\n`);
    return { messageId: "console" };
}

// Brevo transactional email API: plain HTTPS, so it works on hosts that block SMTP
async function sendWithBrevo({ to, subject, html, text }) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
            accept: "application/json",
        },
        body: JSON.stringify({
            sender: from(),
            to: [{ email: to }],
            subject,
            htmlContent: html,
            textContent: text,
        }),
    });
    if (!res.ok) {
        throw new Error(`Brevo send failed: ${res.status} ${await res.text()}`);
    }
    return res.json(); // { messageId }
}

let smtpTransporter = null;
async function sendWithSmtp({ to, subject, html, text }) {
    smtpTransporter ??= nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: Number(process.env.SMTP_PORT || 465) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const { name, email } = from();
    return smtpTransporter.sendMail({ from: `"${name}" <${email}>`, to, subject, text, html });
}

const providers = { console: sendWithConsole, brevo: sendWithBrevo, smtp: sendWithSmtp };

async function sendEmail(message) {
    const provider = providers[process.env.EMAIL_PROVIDER || "console"];
    if (!provider) throw new Error(`Unknown EMAIL_PROVIDER "${process.env.EMAIL_PROVIDER}"`);
    return provider(message);
}

// One template for every OTP email (verification, password reset, ...)
function getOtpEmailHtml({ heading, intro, otp, username = "Developer" }) {
    return `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;background:#0f172a;color:#f8fafc;border-radius:12px">
      <h1 style="color:#38bdf8;font-size:24px;margin:0 0 4px;text-align:center">CodeHub</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;text-align:center">${heading}</p>
      <div style="background:#1e293b;padding:24px;border-radius:8px">
        <p style="margin-top:0">Hello <strong>${username}</strong>,</p>
        <p style="color:#94a3b8;line-height:1.6">${intro} This code is valid for <strong>10 minutes</strong>.</p>
        <p style="text-align:center;margin:28px 0">
          <span style="display:inline-block;font-size:32px;font-weight:800;letter-spacing:8px;color:#38bdf8;background:#0f172a;padding:14px 28px;border-radius:8px;border:1px dashed #38bdf8">${otp}</span>
        </p>
        <p style="color:#64748b;font-size:13px;margin-bottom:0">If you didn't request this, you can ignore this email.</p>
      </div>
    </div>`;
}

module.exports = { sendEmail, getOtpEmailHtml };
```

> `getVerificationEmailHtml` is replaced by `getOtpEmailHtml`. Update the one place that imports it (Part 3.3).

### 3.2 One OTP helper for both features: `src/utils/otp.js`

The existing verification code stores the OTP in plain text, has no limit on wrong guesses per code, and checks the cooldown with a separate read. This helper fixes all three and is reused for password reset:

- The OTP is **hashed** (SHA-256) in Redis, so a Redis leak doesn't reveal live codes.
- **5 wrong attempts** destroy the code.
- The cooldown uses `SET ... NX` (an atomic "set only if missing"), so two fast clicks can't both send.
- The comparison is constant-time (`timingSafeEqual`).

```js
const crypto = require("crypto");
const redisClient = require("../config/redis.config");
const { BadRequestError } = require("./appError");

const OTP_TTL_SECONDS = 10 * 60;        // code valid for 10 minutes
const RESEND_COOLDOWN_SECONDS = 60;     // one new code per minute
const MAX_ATTEMPTS = 5;                 // wrong guesses before the code is destroyed

const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");

const otpKeys = (purpose, userId) => ({
    otp: `otp:${purpose}:${userId}`,
    attempts: `otp_attempts:${purpose}:${userId}`,
    cooldown: `otp_cooldown:${purpose}:${userId}`,
});

/** Creates a new 6-digit code (throws if one was sent less than a minute ago) */
async function issueOtp(purpose, userId) {
    const keys = otpKeys(purpose, userId);

    const allowed = await redisClient.set(keys.cooldown, "1", { EX: RESEND_COOLDOWN_SECONDS, NX: true });
    if (!allowed) {
        throw new BadRequestError(`Please wait ${RESEND_COOLDOWN_SECONDS} seconds before requesting another code`);
    }

    const otp = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
    await redisClient.set(keys.otp, hashOtp(otp), { EX: OTP_TTL_SECONDS });
    await redisClient.del(keys.attempts);
    return otp;
}

/** Throws unless `candidate` matches the stored code; consumes the code on success */
async function verifyOtp(purpose, userId, candidate) {
    const keys = otpKeys(purpose, userId);

    const storedHash = await redisClient.get(keys.otp);
    if (!storedHash) {
        throw new BadRequestError("Code has expired or was not requested");
    }

    const attempts = await redisClient.incr(keys.attempts);
    if (attempts === 1) await redisClient.expire(keys.attempts, OTP_TTL_SECONDS);
    if (attempts > MAX_ATTEMPTS) {
        await redisClient.del([keys.otp, keys.attempts]);
        throw new BadRequestError("Too many wrong attempts. Please request a new code");
    }

    const matches = crypto.timingSafeEqual(
        Buffer.from(storedHash, "hex"),
        Buffer.from(hashOtp(String(candidate).trim()), "hex")
    );
    if (!matches) {
        throw new BadRequestError(`Invalid code. ${MAX_ATTEMPTS - attempts} attempt(s) left`);
    }

    await redisClient.del([keys.otp, keys.attempts, keys.cooldown]); // one-time use
}

module.exports = { issueOtp, verifyOtp, OTP_TTL_SECONDS };
```

New Redis keys (all expire automatically):

| Key | Value | TTL |
|---|---|---|
| `otp:<purpose>:<userId>` | SHA-256 of the code (`purpose` = `email_verify` or `password_reset`) | 10 min |
| `otp_attempts:<purpose>:<userId>` | wrong-guess counter | 10 min |
| `otp_cooldown:<purpose>:<userId>` | "1" | 60 s |

These replace the old `email_otp:<userId>` and `email_cooldown:<userId>` keys.

### 3.3 Simplify `src/services/emailVerification.service.js`

```js
const { user } = require("../models/user");
const { BadRequestError, NotFoundError } = require("../utils/appError");
const { sendEmail, getOtpEmailHtml } = require("../utils/sendEmail");
const { issueOtp, verifyOtp, OTP_TTL_SECONDS } = require("../utils/otp");

async function sendVerificationOtp(userId) {
    const existingUser = await user.findById(userId);
    if (!existingUser) throw new NotFoundError("User not found");
    if (existingUser.isVerified) throw new BadRequestError("Email is already verified");

    const otp = await issueOtp("email_verify", userId);

    await sendEmail({
        to: existingUser.email,
        subject: "Verify your CodeHub email",
        text: `Hello ${existingUser.username},\n\nYour CodeHub verification code is ${otp}. It expires in 10 minutes.`,
        html: getOtpEmailHtml({
            heading: "Email Verification",
            intro: "Use this code to verify your CodeHub email address.",
            otp,
            username: existingUser.username,
        }),
    });

    return { message: "Verification code sent to your email", expiresInSeconds: OTP_TTL_SECONDS };
}

async function verifyEmailOtp(userId, incomingOtp) {
    if (!incomingOtp) throw new BadRequestError("Verification code is required");

    const existingUser = await user.findById(userId);
    if (!existingUser) throw new NotFoundError("User not found");
    if (existingUser.isVerified) throw new BadRequestError("Email is already verified");

    await verifyOtp("email_verify", userId, incomingOtp);

    existingUser.isVerified = true;
    await existingUser.save();

    return { message: "Email verified successfully!", isVerified: true };
}

module.exports = { sendVerificationOtp, verifyEmailOtp };
```

### 3.4 Send the code automatically after signup

**`auth.service.js` → `register()`**: after the refresh token is stored in Redis, add:

```js
const emailVerificationService = require("./emailVerification.service"); // at the top

// Send the verification code, but never fail the signup because of email
try {
    await emailVerificationService.sendVerificationOtp(newUser._id);
} catch (error) {
    console.error("Could not send verification email:", error.message);
}
```

**`userAuth.controller.js` → `registerUser`**: return the user too, so the frontend can log the user in straight away and take them to the verify page:

```js
const { user, accessToken, refreshToken } = await authService.register(req.body);
res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
return res.status(201).json({ accessToken, user });
```

> **Optional upgrade (good for interviews):** emails go through a provider over the network, which takes a few hundred milliseconds and can fail. You already run BullMQ, so you can add an `emails` queue (same pattern as `submission.queue.js`) and call `emailQueue.add("send", { to, subject, html, text })` instead of `await sendEmail(...)`. Signup then never waits on email, and failed sends retry automatically. Keep `attempts: 3` and `removeOnComplete: true`, because the job data contains the code.

### 3.5 Forgot password service: `src/services/passwordReset.service.js`

Two rules matter for security:
- **Never reveal whether an email is registered.** `forgot-password` always gives the same answer.
- **Resetting a password logs out every device:** delete the stored refresh token.

```js
const { user } = require("../models/user");
const redisClient = require("../config/redis.config");
const { BadRequestError } = require("../utils/appError");
const { hashPassword } = require("../utils/hashing");
const { sendEmail, getOtpEmailHtml } = require("../utils/sendEmail");
const { issueOtp, verifyOtp } = require("../utils/otp");
const { forgotPasswordValidation, resetPasswordValidation } = require("../utils/validateReqBody");

const GENERIC_MESSAGE = "If an account exists for this email, a reset code has been sent.";

async function requestPasswordReset(payload) {
    const validation = forgotPasswordValidation.safeParse(payload);
    if (!validation.success) {
        throw new BadRequestError("Invalid request body", validation.error.issues);
    }

    const existingUser = await user.findOne({ email: validation.data.email });
    if (!existingUser) return { message: GENERIC_MESSAGE }; // don't reveal that it doesn't exist

    try {
        const otp = await issueOtp("password_reset", existingUser._id);
        await sendEmail({
            to: existingUser.email,
            subject: "Your CodeHub password reset code",
            text: `Hello ${existingUser.username},\n\nYour password reset code is ${otp}. It expires in 10 minutes.\nIf you didn't ask for this, ignore this email.`,
            html: getOtpEmailHtml({
                heading: "Password Reset",
                intro: "Use this code to reset your CodeHub password.",
                otp,
                username: existingUser.username,
            }),
        });
    } catch (error) {
        // Cooldown or provider errors are logged, not returned: the answer must look the same either way
        console.error("Password reset email not sent:", error.message);
    }

    return { message: GENERIC_MESSAGE };
}

async function resetPassword(payload) {
    const validation = resetPasswordValidation.safeParse(payload);
    if (!validation.success) {
        throw new BadRequestError("Invalid request body", validation.error.issues);
    }
    const { email, otp, newPassword } = validation.data;

    const existingUser = await user.findOne({ email });
    if (!existingUser) throw new BadRequestError("Invalid or expired code");

    await verifyOtp("password_reset", existingUser._id, otp);

    existingUser.password = await hashPassword(newPassword);
    existingUser.isVerified = true; // they just proved they own this inbox
    await existingUser.save();

    await redisClient.del(`refreshToken:${existingUser._id}`); // log out everywhere

    return { message: "Password reset successfully. Please log in with your new password." };
}

module.exports = { requestPasswordReset, resetPassword };
```

### 3.6 Validation schemas: `src/utils/validateReqBody.js`

Pull the password rules into one reusable schema (they're currently copied three times), then add:

```js
const passwordSchema = z.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(32, { message: 'Password cannot exceed 32 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' });

const forgotPasswordValidation = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email format"),
});

const resetPasswordValidation = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email format"),
    otp: z.string().trim().regex(/^\d{6}$/, "Code must be 6 digits"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

// add both to module.exports
```

(Optionally, use `passwordSchema` in `userValidation.password` and `changePasswordValidation.newPassword` as well.)

### 3.7 Controller + routes

`src/controllers/passwordReset.controller.js`:

```js
const passwordResetService = require("../services/passwordReset.service");

async function forgotPassword(req, res) {
    try {
        const result = await passwordResetService.requestPasswordReset(req.body);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message, ...(error.details && { details: error.details }) });
    }
}

async function resetPassword(req, res) {
    try {
        const result = await passwordResetService.resetPassword(req.body);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message, ...(error.details && { details: error.details }) });
    }
}

module.exports = { forgotPassword, resetPassword };
```

`src/middleware/rateLimiter.middleware.js`: add two limiters (and export them):

```js
// forgot-password: 5 requests per 15 minutes per IP
const forgotPasswordLimiter = createRateLimiter({
    prefix: 'forgot-password', limit: 5, windowSeconds: 15 * 60, actionName: 'password reset requests',
});

// reset-password: 10 attempts per 15 minutes per IP (the OTP itself also allows only 5 wrong guesses)
const resetPasswordLimiter = createRateLimiter({
    prefix: 'reset-password', limit: 10, windowSeconds: 15 * 60, actionName: 'password reset attempts',
});
```

`src/routes/auth.routes.js`: public routes, so no `authMiddleware`:

```js
const { forgotPassword, resetPassword } = require("../controllers/passwordReset.controller");
// ...
authRoute.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
authRoute.post("/reset-password", resetPasswordLimiter, resetPassword);
```

### 3.8 Decide what "unverified" means (recommended)

Today `isVerified` is never checked anywhere. A common policy: **unverified users can browse and Run, but must verify before Submit.** Add `src/middleware/requireVerified.middleware.js`:

```js
const { user } = require("../models/user");

async function requireVerified(req, res, next) {
    const found = await user.findById(req.user.id).select("isVerified");
    if (!found?.isVerified) {
        return res.status(403).json({ error: "Please verify your email before submitting", code: "EMAIL_NOT_VERIFIED" });
    }
    next();
}

module.exports = { requireVerified };
```

and in `execution.routes.js`:

```js
executionRouter.post('/submit', authMiddleware, requireVerified, submitCodeLimiter, submitCode);
```

(It's checked against the database, not the JWT, so it takes effect the moment the user verifies.)

### 3.9 Final endpoint list

| Method | URL | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/auth/register` | — | as before | `201 { accessToken, user }`; a verification code is emailed |
| POST | `/api/user/send-verify-email` | ✅ | — | resend the verification code (60 s cooldown) |
| POST | `/api/user/verify-email` | ✅ | `{ otp }` | `{ isVerified: true }` |
| POST | `/api/auth/forgot-password` | — | `{ email }` | always `200 { message: "If an account exists…" }` |
| POST | `/api/auth/reset-password` | — | `{ email, otp, newPassword, confirmPassword }` | `200`; all sessions logged out |

---

## Part 4: Frontend

### 4.1 Routes (`App.jsx`)

```jsx
<Route path="/verify-email"    element={isAuthenticated ? <VerifyEmail /> : <Navigate to="/login" />} />
<Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" /> : <ForgotPassword />} />
<Route path="/reset-password"  element={isAuthenticated ? <Navigate to="/" /> : <ResetPassword />} />
```

The login page already links to `/forgot-password`.

### 4.2 Signup: log in and go to verification

In `pages/signup.jsx` → `onSubmit`, replace the redirect to login:

```js
const res = await api.post("/auth/register", { ...payload });
navigate("/verify-email");
dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
```

(Add `useDispatch` and import `setCredentials`, the same way `login.jsx` does. Call `navigate` before `dispatch` so the "/signup → redirect to /" rule doesn't run first.)

### 4.3 `pages/verify-email.jsx`

The screen has:
- A **6-digit code input** (`inputMode="numeric"`, `maxLength={6}`, `autoComplete="one-time-code"`, which lets phones auto-fill the code from the email).
- **Verify** → `api.post("/user/verify-email", { otp })` → on success `dispatch(fetchUserProfile())` and `navigate("/")`.
- **Resend code**, which calls `api.post("/user/send-verify-email")`. Disable it with a **60-second countdown** after each send:

  ```js
  const [cooldown, setCooldown] = useState(60); // a code was just sent at signup
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);
  ```
- **Skip for now**, a link to `/` (they can verify later from the banner).
- Show errors from `err.response.data.error` (e.g. "Invalid code. 3 attempt(s) left").

### 4.4 Unverified banner on the home page

`profile.isVerified` already comes from `GET /api/user/profile`. In `homepage.jsx`, above the welcome card:

```jsx
{profile && !profile.isVerified && (
  <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#ffa116]/30 bg-[#ffa116]/10 text-sm">
    <span className="text-[#ffc46b]">Verify your email to submit solutions.</span>
    <Link to="/verify-email" className="font-semibold text-[#ffa116] hover:underline">Verify now</Link>
  </div>
)}
```

On the problem page, if Submit returns `403` with `code: "EMAIL_NOT_VERIFIED"`, show the same message with a link to `/verify-email`.

### 4.5 `pages/forgot-password.jsx`

- One email field (reuse the login page's styling).
- Submit → `api.post("/auth/forgot-password", { email })` → `navigate("/reset-password", { state: { email } })`.
- Show the server's generic message. Don't say "no account found".

### 4.6 `pages/reset-password.jsx`

- Fields: **email** (prefilled from `location.state?.email`), **6-digit code**, **new password** (reuse the `PasswordStrength` component from signup), **confirm password**.
- Validate with zod, using the same password rules as signup.
- Submit → `api.post("/auth/reset-password", { email, otp, newPassword, confirmPassword })` → `navigate("/login", { state: { passwordReset: true } })`.
- **Resend code** → `api.post("/auth/forgot-password", { email })`, with the same 60-second countdown.

On `login.jsx`, show a green banner when `location.state?.passwordReset` is set: "Password updated. Please sign in."

---

## Part 5: Testing checklist

**Locally (`EMAIL_PROVIDER=console`, the code is printed in the backend terminal):**

- [ ] Sign up → you land on `/verify-email`, and the terminal shows a `[MOCK EMAIL]` with a code.
- [ ] Wrong code → "Invalid code. 4 attempt(s) left"; 6 wrong codes → "Too many wrong attempts".
- [ ] Resend within 60 s → the button is disabled; the API returns "Please wait 60 seconds".
- [ ] Correct code → home page, banner gone, Submit works.
- [ ] Unverified user clicks Submit → 403 "Please verify your email".
- [ ] Forgot password with an **unknown** email → the same success message, and no email is printed.
- [ ] Forgot password with a real email → code printed → reset → old password fails, new one works.
- [ ] After a reset, another logged-in browser is logged out within 15 minutes, once its access token expires and the refresh fails.

**Real emails (`EMAIL_PROVIDER=brevo`):**

- [ ] Send to your own inbox **and** a different address (check Spam).
- [ ] The message shows as "Delivered" in Brevo → Transactional → Logs.

**Deployed:** set the env variables on the host, then repeat the Brevo checks.

---

## Part 6: Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| `ETIMEDOUT` / `ENETUNREACH` connecting to `smtp.gmail.com` after deploying | Your host blocks SMTP (e.g. Render free). Use `EMAIL_PROVIDER=brevo` |
| Brevo `401 Unauthorized` / `unrecognised IP address` | Turn off IP blocking under Brevo → Settings → Security → Authorised IPs |
| Brevo `400 ... sender ... not valid` | `EMAIL_FROM_ADDRESS` must exactly match a sender you verified in Brevo |
| Emails land in Spam | Expected when sending as a Gmail address through Brevo; add plain-text versions (already done) and keep the content simple. The full fix is your own domain + DKIM |
| Gmail SMTP `535 Username and Password not accepted` | Use a 16-character **App Password** with 2-Step Verification on, not your normal password |
| Code "expired" immediately | Server clock or Redis TTL problem; check `TTL otp:email_verify:<id>` in Redis |
| Hit 300/day | Brevo's free cap; it resets daily. More would need a paid plan |

---

## Sources

- [Render: free web services no longer allow outbound traffic to SMTP ports](https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports)
- [Railway: SMTP ports question](https://station.railway.com/questions/please-unblock-outbound-smtp-ports-for-o-640ce726)
- [Brevo free SMTP / plan (300 emails/day)](https://www.brevo.com/free-smtp-server/)
- [Brevo transactional email technical guide (DKIM, @brevosend.com)](https://www.captaindns.com/en/blog/brevo-transactional-email-technical-guide)
- [Resend account quotas and limits](https://resend.com/docs/knowledge-base/account-quotas-and-limits)
