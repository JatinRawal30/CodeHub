# CodeHub: Codebase Audit

Scope: everything in `backend/` and `Frontend/` plus root-level files, reviewed on 2026-10-16.
Severity: **Critical** = security hole or data leak · **High** = real bug users will hit, or a design that breaks under load · **Medium** = maintainability/robustness problem · **Low** = polish/hygiene.

For how the code works, see [CODEBASE_GUIDE.md](CODEBASE_GUIDE.md).

> **Status (2026-10-17):** fixed: **A1, A2, A3, A4, A7, A8, B1, B2, B3, B4, B5, B6, B7, B9 (retries + Internal Error verdict), B14, C1 (BullMQ queue), C12 (problem page with Monaco editor), A11 (profile update validation)**. Everything else below is still open. Note: `backend/test-demo.js` still expects the old synchronous submit response.

---

## A. Security

| # | Sev | Where | Problem | Fix |
|---|---|---|---|---|
| A1 | **Critical** | [problem.service.js:111-113](backend/src/services/problem.service.js#L111-L113) | `GET /api/problems/:id` is public and excludes `-hiddenTestCases -referenceSolution`, but **not `referenceSolutions` (plural)**. After `updateCppReferenceSolution.js` runs, every problem returns the full C++ and Python answers to anyone. | Exclude `referenceSolutions` too, or better, mark solution and hidden-test fields `select: false` in the schema so they're never returned unless asked for. |
| A2 | **Critical** | [problem.service.js:136-138](backend/src/services/problem.service.js#L136-L138) | User input goes straight into `$regex`. Typing `(` in the search box returns a **500**; crafted patterns enable ReDoS against MongoDB. | Escape regex metacharacters (`s.replace(/[.*+?^${}()\|[\]\\]/g, '\\$&')`), cap length, or use a text index. |
| A3 | High | [auth.routes.js:8-11](backend/src/routes/auth.routes.js#L8-L11) | No rate limit on `/login`, `/register`, `/refresh`. Password brute force and account-creation spam are unlimited. | Apply `createRateLimiter` (keyed on IP + identifier) to these routes. |
| A4 | High | [auth.service.js:61-72](backend/src/services/auth.service.js#L61-L72) | `identifier` is never type-checked. `{"identifier":{"$regex":"^a"},"password":"..."}` turns into a Mongo operator query (NoSQL operator injection) that matches arbitrary users. | Validate login body with zod (`z.string()`), or enable `mongoose.set('sanitizeFilter', true)`. |
| A5 | High | [execution.service.js](backend/src/services/execution.service.js), [pistonApi.js:10](backend/src/utils/pistonApi.js#L10) | All user code and hidden test cases go to the **public** `ce.judge0.com` with no API key: no SLA, shared rate limits, and the hidden tests leave your infrastructure. | Self-host Judge0 (Docker) or use the RapidAPI plan with a key from env. |
| A6 | Medium | [userAuth.controller.js:3-8](backend/src/controllers/userAuth.controller.js#L3-L8), [userProfile.controller.js:3-8](backend/src/controllers/userProfile.controller.js#L3-L8), [index.js:15-18](backend/src/index.js#L15-L18) | `secure: false` and the CORS origin `http://localhost:5173` are hard-coded. Deploying as-is sends the refresh cookie over plain HTTP and blocks the real frontend origin. | Drive both from env (`NODE_ENV`, `CLIENT_ORIGIN`). |
| A7 | Medium | [redis.config.js:7-8](backend/src/config/redis.config.js#L7-L8) | Redis host/port hard-coded in source. | Move to `REDIS_URL` in `.env`. |
| A8 | Medium | Repo root | It isn't a git repo and there's no root/backend `.gitignore`. The first `git init && git add .` will commit `backend/.env` (DB, JWT, Redis secrets) and three `node_modules` folders. | Add a root `.gitignore` (`node_modules`, `.env`, `dist`) and a `backend/.env.example` before initializing git. |
| A9 | Medium | [index.js](backend/src/index.js) | No `helmet` (security headers) and no explicit JSON body size limit. | `app.use(helmet())`, `express.json({ limit: '100kb' })` (set it explicitly, since code submissions are the large bodies). |
| A10 | Medium | All services | `isVerified` is set but **never enforced**: unverified users can do everything. Verification is decorative. | Decide the policy (e.g. require verification to submit) and add a `requireVerified` middleware. |
| A11 | Medium | [user.service.js:177-187](backend/src/services/user.service.js#L177-L187) | `updateMyProfile` has no zod schema: `avatar` can be any string (e.g. `javascript:` URL), `languagePreferences` any array of anything. | Add an `updateProfileValidation` schema (URL check for avatar, enum for languages). |
| A12 | Low | [user.js:40-44](backend/src/models/user.js#L40-L44) | `password` isn't `select: false`, so any future `user.find()` returns hashes. [user.service.js:217](backend/src/services/user.service.js#L217) uses `.select("+password")`, which only makes sense if that flag were set. | Add `select: false` to the schema. |
| A13 | Low | [user.service.js:110-111](backend/src/services/user.service.js#L110-L111) | Public profile exposes `role`, letting anyone enumerate admins. | Drop `role` from the public response. |
| A14 | Low | [emailVerification.service.js:73](backend/src/services/emailVerification.service.js#L73) | OTP compared with `!==` (not constant-time). OTP isn't invalidated after N wrong guesses; only the route limiter protects it. | `crypto.timingSafeEqual`; delete the OTP after 5 failures. |

## B. Correctness bugs

| # | Sev | Where | Problem | Fix |
|---|---|---|---|---|
| B1 | High | [databaseConnect.js:4-9](backend/src/config/databaseConnect.js#L4-L9) + [index.js:27-36](backend/src/index.js#L27-L36) | `dbConnect` **swallows** its error, so `Promise.all` resolves, the log says "Connected to both database and redis", and the server listens with no DB. Conversely, a Redis failure logs and leaves the process alive doing nothing. | Let `dbConnect` throw; in `connection()`'s catch, `process.exit(1)`. |
| B2 | High | [auth.service.js:31](backend/src/services/auth.service.js#L31) | Registering an existing email/username throws Mongo `E11000` → **500** with the raw driver message (collection and index names) shown in the signup form. | Catch code `11000` → `ConflictError("Email already registered")`, or check first. |
| B3 | High | [validateReqBody.js:7](backend/src/utils/validateReqBody.js#L7) vs [user.js:9-10](backend/src/models/user.js#L9-L10) | zod allows `firstName`/`lastName` up to 100 chars, but the schema caps at 20 → names of 21–100 chars pass validation and then fail with a Mongoose **500**. | Make one source of truth (max 20 in both, or derive). |
| B4 | High | [signup.jsx:12-19](Frontend/src/pages/signup.jsx#L12-L19) vs backend | Frontend requires first/last name ≥ 1 char and **requires** lastName; backend requires ≥ 3 and lastName optional. "Al" passes the form and then fails with a generic "Invalid request body" (the `details` array is ignored at [signup.jsx:124-127](Frontend/src/pages/signup.jsx#L124-L127)). | Share limits; display `details[].message` from the API. |
| B5 | High | [axios.js:20-43](Frontend/src/api/axios.js#L20-L43), [App.jsx:12-14](Frontend/src/App.jsx#L12-L14) | **Refresh race with token rotation.** When several requests 401 at once (Homepage fires `/problems`, `/problems/solved` and `/user/profile` ×2 together), each calls `/auth/refresh` with the same cookie. The first rotates it; the rest present a now-stale token → "revoked" → `clearAuth()` → **user is logged out**. In development, `StrictMode` dispatches `checkAuth` twice on load, which can trigger the same race. | Keep a single in-flight refresh promise in the interceptor and queue other requests behind it; guard `checkAuth` against double dispatch. |
| B6 | High | [user.service.js:214](backend/src/services/user.service.js#L214) | `changePasswordValidation.parse()` (not `safeParse`) throws a `ZodError` with no `statusCode` → any invalid change-password body returns **500**. | Use `safeParse` + `BadRequestError` like every other service. |
| B7 | High | [execution.service.js:66](backend/src/services/execution.service.js#L66), [:177](backend/src/services/execution.service.js#L177) | "Compilation error" is detected by `status 6 \|\| compileOutput`. Judge0 returns **compiler warnings** in `compile_output` on successful builds (common in C/C++/Java), so valid code that compiles with a warning is judged "Compilation Error". | Rely on `statusId === 6` only. |
| B8 | Medium | [pistonApi.js:34-41](backend/src/utils/pistonApi.js#L34-L41) | Judge0's default `max_submission_batch_size` is 20. A problem with more than 20 total test cases will fail on submit. | Chunk the batch into groups of 20. |
| B9 | Medium | [pistonApi.js:65-99](backend/src/utils/pistonApi.js#L65-L99) | Fixed 15 × 1 s polling: a busy public queue → "timed out" → submission stored as **Runtime Error**, which blames the user's code for an infrastructure failure. | Add an `Internal Error`/`Judge Unavailable` verdict; use backoff. |
| B10 | Medium | [emailVerification.service.js:73](backend/src/services/emailVerification.service.js#L73) | `incomingOtp.trim()` crashes (500) when `otp` is sent as a number. | `String(incomingOtp).trim()` or zod schema. |
| B11 | Medium | [problem.service.js:133](backend/src/services/problem.service.js#L133) | `?tags=a&tags=b` makes `tags` an array → `tags.split` throws → 500. | Normalize: `[].concat(tags).flatMap(t => t.split(','))`. |
| B12 | Medium | [problem.service.js:141](backend/src/services/problem.service.js#L141) | `limit` has no upper bound (`?limit=1000000`). | `Math.min(limitNum, 100)`. |
| B13 | Medium | [rateLimiter.middleware.js:19-24](backend/src/middleware/rateLimiter.middleware.js#L19-L24) | `INCR` and `EXPIRE` are separate calls; if the process dies in between, the key never expires and that user is **permanently** rate-limited. | `MULTI`/Lua script, or `SET key 0 EX n NX` then `INCR`. |
| B14 | Low | [rateLimiter.middleware.js:38](backend/src/middleware/rateLimiter.middleware.js#L38) | Message always says "per minute", but email limiters use 15-minute windows. | Build the message from `windowSeconds`. |
| B15 | Medium | [auth.service.js:41,90](backend/src/services/auth.service.js#L90) | One refresh token per user (`refreshToken:<userId>`). Logging in on a second device silently logs out the first one within 15 min. Probably unintended. | Key by session/device ID (`refreshToken:<userId>:<sessionId>`). |
| B16 | Medium | [problem.service.js:94](backend/src/services/problem.service.js#L94) | Deleting a problem leaves orphaned submissions and stale IDs in every user's `problemsSolved`. | Soft-delete (`isActive: false`), or cascade in a transaction. |
| B17 | Medium | [auth.service.js:199-226](backend/src/services/auth.service.js#L199-L226) | Account deletion runs user delete + submissions delete without a transaction; a failure halfway leaves orphans. Problems they authored keep a dangling `problemCreator`. | Use a Mongo session/transaction; decide what happens to authored problems. |
| B18 | Medium | [homepage.jsx:124-134](Frontend/src/pages/homepage.jsx#L124-L134) | "Solved/Unsolved" filter is applied client-side to the current page of 10, so page counts and "Showing x of y" are wrong and pages can appear empty. | Add a `status` filter to `GET /problems` server-side. |
| B19 | Low | [ProblemFilters.jsx:28](Frontend/src/components/ProblemFilters.jsx#L28) | Placeholder says "Search by title or ID", but the backend only searches `title`. | Search `problemID` too when the input is numeric, or fix the text. |
| B20 | Low | [userAuth.controller.js:17-19](backend/src/controllers/userAuth.controller.js#L17-L19), [signup.jsx:122](Frontend/src/pages/signup.jsx#L122) | Register creates tokens, stores one in Redis and sets a cookie, then the frontend throws it away and asks the user to log in again. | Either auto-login after signup, or don't issue tokens on register. |
| B21 | Low | [auth.service.js:75-81](backend/src/services/auth.service.js#L75-L81) | Wrong credentials return **400**; conventional is **401**. | Use `UnauthorizedError`. |
| B22 | Low | [Navbar.jsx:156-160](Frontend/src/components/Navbar.jsx#L156-L160) | Dropdown avatar `<img>` has no `onError`, unlike the button avatar. | Extract an `<Avatar>` component with fallback. |

## C. Architecture

| # | Sev | Where | Problem | Recommendation |
|---|---|---|---|---|
| C1 | High | [execution.service.js:128-243](backend/src/services/execution.service.js#L128-L243) | Judging happens **synchronously inside the HTTP request** (up to ~16 s of polling). Each submit ties up a request and its client; a slow judge means timeouts, and there's no retry. The "write Pending first" step exists but nothing ever picks Pending submissions back up. | Use a job queue (BullMQ on the Redis you already have): `POST /submit` → 202 + `submissionId`; a worker judges; the client polls `GET /submissions/:id` or gets a WebSocket/SSE push. |
| C2 | High | Every controller | No global error handler. 17 near-identical `try/catch` blocks, inconsistently returning `{error}` or `{message}`. Express 5 already forwards async errors to `next(err)`. | One `errorHandler` middleware that maps `AppError`, `ZodError`, Mongo `11000`/`CastError`/`ValidationError`; remove all controller try/catch. |
| C3 | Medium | Services | Validation is done inside services, not at the boundary. | `validate(schema)` middleware per route, so services receive clean data. |
| C4 | Medium | [auth.service.js:199-226](backend/src/services/auth.service.js#L199-L226) | AuthService deletes submissions (a different domain) and holds profile-deletion logic. The route lives at `DELETE /api/auth/profile` while all other profile routes live under `/api/user/profile`. | Move to `UserService` / `DELETE /api/user/profile`. |
| C5 | Medium | [user.js:50-56](backend/src/models/user.js#L50-L56) | `problemsSolved` is denormalized onto the user and grows without bound; it can drift from Submissions (see B16). | Derive from Submissions (`distinct problemId where verdict=Accepted`) or a separate `UserProblemStatus` collection. |
| C6 | Medium | [Submission.js](backend/src/models/Submission.js) | No indexes. Every "my submissions" and profile aggregation is a collection scan. | `{userId:1, problemId:1, createdAt:-1}` and `{userId:1, verdict:1}`. |
| C7 | Medium | [Problem.js:71-114](backend/src/models/Problem.js#L71-L114) | Two parallel representations: `referenceSolution` + `referenceSolutions[]`, `starterCode` + `starterCodes[]`. The singular ones are required, so data is duplicated and can disagree. | Keep only the arrays (or a map keyed by language). |
| C8 | Medium | [Problem.js:45-56](backend/src/models/Problem.js#L45-L56) | Hidden test cases are embedded in the problem document; any query that forgets to exclude them leaks them (see A1). | `select: false` on sensitive fields, or a separate `TestCase` collection. |
| C9 | Medium | Backend | No config module: `process.env` is read in 6 files, `dotenv` is loaded in 3 places, and env vars are never validated at startup (a missing `JWT_KEY` only fails at first login). | One `config/env.js` that loads and zod-validates env once and exports a typed object. |
| C10 | Medium | [index.js](backend/src/index.js) | `index.js` builds the app **and** starts the server, so it can't be imported for tests; that's why [test-demo.js](backend/test-demo.js) re-creates the app by hand. | Split into `app.js` (export app) + `server.js` (listen). |
| C11 | Medium | Backend | No graceful shutdown (`SIGTERM` → close server, Mongo, Redis), no `/health` endpoint, no structured logging (only `console.log`), no request IDs. | `pino`/`pino-http`, `/healthz`, signal handlers. |
| C12 | Medium | Frontend | The core product, the problem page with code editor, Run/Submit and submissions, **doesn't exist**. Problem titles look clickable but do nothing. Half the backend (execution, profile editing, email verification, change password, admin) has no UI. | Next milestone: `/problems/:id` with Monaco editor. |
| C13 | Medium | [App.jsx](Frontend/src/App.jsx), [homepage.jsx:16](Frontend/src/pages/homepage.jsx#L16) | "Problems / Contest / Chat" are local `useState` tabs, not routes. No deep links, the back button doesn't work, no 404 route, no reusable `<ProtectedRoute>`, no error boundary. | Nested routes with a layout route containing the Navbar. |
| C14 | Medium | Frontend | Data fetching is hand-rolled in components (`useEffect` + `isMounted` flags), with no caching, dedup or retry, and errors are only `console.error`'d (the user sees "No problems found" on failure). | TanStack Query or RTK Query; a `services/` layer for API calls. |
| C15 | Medium | [axios.js:2](Frontend/src/api/axios.js#L2) ↔ [authSlice.js:3](Frontend/src/store/slices/authSlice.js#L3) | Circular import: `axios.js → store → authSlice → axios.js`. It works only because access is deferred; it's fragile to refactors. | Inject the store into axios at startup (`setupInterceptors(store)`). |
| C16 | Low | [authSlice.js:62](Frontend/src/store/slices/authSlice.js#L62) | `profile` (user data) lives in the **auth** slice. | Separate `profile`/`user` slice or a query cache. |
| C17 | Low | Backend | No API versioning (`/api/v1`), and aliases (`/create`, `/list`, `/get/:id`, `/update/:id`, `/delete/:id`) double the route surface. | Drop the aliases (nothing in the frontend uses them); add `/api/v1`. |
| C18 | Low | — | No admin bootstrap: the first admin can only be made by editing MongoDB by hand. | A one-off `scripts/createAdmin.js`. |
| C19 | Low | [auth.middleware.js](backend/src/middleware/auth.middleware.js) | The role is read from the JWT, so a demoted admin keeps admin rights for up to 15 min. Acceptable, but should be a conscious choice. | Document it, or check role from DB/cache for admin routes. |

## D. Redundancy / duplication

| # | Where | What's duplicated | Fix |
|---|---|---|---|
| D1 | [auth.middleware.js:4-33 vs 35-69](backend/src/middleware/auth.middleware.js#L4-L69) | `adminAuthMiddleware` copies all of `authMiddleware`. | `requireRole('admin')` that runs after `authMiddleware`. |
| D2 | auth.service ×3, user.service ×1 | "generate token pair + store refresh in Redis + build user DTO" repeated 4 times. | `issueSession(user)` helper. |
| D3 | [auth.service.js:111-116, 210-215](backend/src/services/auth.service.js#L111-L116) | Access-token blacklisting logic, twice. | `revokeAccessToken(token, exp)`. |
| D4 | 2 controllers + 4 `clearCookie` calls | `REFRESH_COOKIE_OPTIONS` defined twice; clear-cookie options typed out 4 times. | One `utils/cookies.js`. |
| D5 | `REFRESH_TOKEN_EXPIRY` (auth.service), `60*60*24*7` (user.service), `'7d'` (generateToken), `7*24*60*60*1000` (controllers ×2) | Same 7-day constant in 4 forms. | Single constant in config. |
| D6 | [execution.service.js:13-30](backend/src/services/execution.service.js#L13-L30) vs [problem.service.js:18-28](backend/src/services/problem.service.js#L18-L28) | Two "resolve `_id` or numeric problemID" helpers. | One shared helper / Problem static method. |
| D7 | `/api/execution/submissions/:pId` and `/api/problems/:id/submissions` | Two routes for the same thing; the controller even reads `pId \|\| problemId \|\| id`. | Keep one. |
| D8 | [execution.service.js:75-115 vs 169-210](backend/src/services/execution.service.js#L75-L210) | Verdict classification (TLE / RE / compare) written twice for run and submit. | `classifyResult(resp, expected)`. |
| D9 | [problem.service.js:194-198](backend/src/services/problem.service.js#L194-L198), [user.service.js:98-102](backend/src/services/user.service.js#L98-L102) | Difficulty breakdown computed twice (also with three `.filter` passes each). | Shared helper or `$group` aggregation. |
| D10 | [validateReqBody.js](backend/src/utils/validateReqBody.js) | Password rules copied 3 times (register, oldPassword, newPassword). `oldPassword` shouldn't enforce complexity at all: a user whose old password predates the rules can never change it. | `const passwordSchema = ...`; `oldPassword: z.string().min(1)`. |
| D11 | Tags list ([Problem.js:27](backend/src/models/Problem.js#L27), [validateReqBody.js:32](backend/src/utils/validateReqBody.js#L32)); languages ([Submission.js:18](backend/src/models/Submission.js#L18), [validateReqBody.js:39](backend/src/utils/validateReqBody.js#L39), [pistonApi.js:2](backend/src/utils/pistonApi.js#L2)) | Enums duplicated across files. | `constants/` module. |
| D12 | [user.js:76-83](backend/src/models/user.js#L76-L83) | Manual `createdAt`/`updatedAt` fields plus `timestamps: true`. | Remove the manual fields. |
| D13 | [homepage.jsx:55](Frontend/src/pages/homepage.jsx#L55) + [Navbar.jsx:17-21](Frontend/src/components/Navbar.jsx#L17-L21) | Both fetch `/user/profile` on mount → 2 identical requests (more under StrictMode). | Fetch once (layout or query cache). |
| D14 | [authSlice.js:13](Frontend/src/store/slices/authSlice.js#L13), [axios.js:6,28](Frontend/src/api/axios.js#L6) | `http://localhost:3200` hard-coded 3 times. | `import.meta.env.VITE_API_URL`. |
| D15 | [login.jsx](Frontend/src/pages/login.jsx), [signup.jsx](Frontend/src/pages/signup.jsx) | ~60% identical: input markup ×7 with inline `onFocus`/`onBlur` style mutation, spinner SVG, error banner, card, footer, divider. | `<TextField>`, `<PasswordField>`, `<Spinner>`, `<Alert>`, `<AuthLayout>`. |
| D16 | [Navbar.jsx:62](Frontend/src/components/Navbar.jsx#L62), [SettingsModal.jsx:19](Frontend/src/components/SettingsModal.jsx#L19), [user.js:60](backend/src/models/user.js#L60) | Default avatar URL ×3; avatar-with-fallback markup ×3; "derive username/displayName/email" logic ×2. | `<Avatar>` + a `selectDisplayUser` selector. |
| D17 | Frontend | Colors such as `#ffa116`, `#282828`, `#383838` are hard-coded hex in ~150 places, mixed between `className` and `style`. | Tailwind v4 `@theme` tokens. |
| D18 | Frontend | Zod schemas re-implement backend rules by hand (and already disagree, B4). | Share a schema package or generate from the backend. |
| D19 | [jatin.txt](backend/jatin.txt) vs [Documentation_CodeHub.md](backend/Documentation_CodeHub.md) | Near-identical docs; plus `codehub_architecture.html` and `readme.txt`. | Keep one `README.md` + `docs/`. |
| D20 | [updateCppStarterCode.js](backend/src/utils/updateCppStarterCode.js), [updateCppReferenceSolution.js](backend/src/utils/updateCppReferenceSolution.js), [seedProblems.js](backend/src/utils/seedProblems.js) | ~2,100 lines of problem data split across three scripts that must run in order. | One seed with all languages per problem, data in JSON under `seed/`. |

## E. Structure and project hygiene

| # | Sev | Where | Problem | Fix |
|---|---|---|---|---|
| E1 | Medium | Root `package.json`, `node_modules/` | A stray root install with frontend libraries (tailwind, daisyui, react-router, axios...) that neither app uses. | Delete it, or turn the root into an npm workspace that owns both apps. |
| E2 | Medium | `backend/src/utils/` | One-off DB scripts live in `utils/` next to runtime helpers, and there's no npm script for them. | Move to `backend/scripts/`; add `"seed"` to package.json. |
| E3 | Medium | Both apps | **No automated tests** (backend `test` script is the npm placeholder; `test-demo.js` hits real cloud DB/Redis/Judge0 and always exits 0). No lint on backend, no Prettier, no CI. | Jest/Vitest + supertest + mongodb-memory-server; ESLint; GitHub Actions. |
| E4 | Low | Naming | `pistonApi.js` actually calls Judge0; backend `package.json` name is `"leetcode"`; folders `Frontend` vs `backend`; models `user.js` vs `Problem.js`; pages `login.jsx` vs components `Navbar.jsx`. `user` model exported as `{ user }` while others are default exports. | `judge0.client.js`, consistent PascalCase models / components, consistent export style. |
| E5 | Low | [user.js:17](backend/src/models/user.js#L17) | `optional: true` isn't a Mongoose option (no effect). | Remove. |
| E6 | Low | [Frontend/package.json](Frontend/package.json) | Both `react-router` and `react-router-dom` installed; imports are mixed across files. In v7 `react-router` is enough. | Remove `react-router-dom`, import from `react-router`. |
| E7 | Low | [index.css](Frontend/src/index.css) | daisyUI is installed and loaded but no daisyUI classes are used. | Use it or remove it. |
| E8 | Low | Frontend | Leftover Vite template: `<title>frontend</title>`, template `README.md`, unused `hero.png`, `vite.svg`, empty `react.svg`. | Clean up. |
| E9 | Low | [login.jsx:160-165](Frontend/src/pages/login.jsx#L160-L165), [login.jsx:259-269](Frontend/src/pages/login.jsx#L259-L269) | "Forgot Password?" links to a route that doesn't exist (no backend either); footer claims "protected by reCAPTCHA", which isn't true; "LeetCode Edition" badge uses a third party's trademark. | Remove or implement. |
| E10 | Low | [Pagination.jsx:37](Frontend/src/components/Pagination.jsx#L37) | Renders a button for **every** page; unusable at hundreds of pages. | Windowed pagination (1 … 4 5 6 … 40). |
| E11 | Low | Frontend forms/modal | `<label>`s aren't associated with inputs (`htmlFor`/`id`); the modal has no `role="dialog"`, focus trap or Escape handling. | Accessibility pass. |
| E12 | Low | [authSlice.js:97-99](Frontend/src/store/slices/authSlice.js#L97-L99) | `setLoading` and `setUserProfile` actions are never used. | Remove. |
| E13 | Low | [readme.txt](backend/readme.txt) | Documents `/api/admin/register`; the real route is `/api/auth/admin/register`. | Fix or delete (superseded by `CODEBASE_GUIDE.md`). |
| E14 | Low | Both | No TypeScript; API response shapes are guessed in the UI (`p._id?.toString() \|\| p.id?.toString()`, `user?.profile?.avatar`, etc.). | Gradual TS, or at least JSDoc types for API DTOs. |

---

## Suggested order of work

1. **Today (security):** A1 (solution leak), A2 (regex), A3 (login rate limit), A4 (operator injection), A8 (`.gitignore` before git).
2. **This week (bugs users hit):** B1, B2, B3/B4, B5 (refresh race), B6, B7.
3. **Foundation:** C2 global error handler + D1–D5 cleanup, C9 config module, C10 app/server split, E3 first tests.
4. **Product:** C12 problem page + editor, then C1 queue-based judging.
