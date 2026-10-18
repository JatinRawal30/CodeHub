# CodeHub: The Complete Codebase Guide (Beginner Friendly)

This guide explains **every part** of the CodeHub project, from "what is this app?" down to "which line of code runs when I click Sign In". You do not need prior knowledge of this codebase. If you know a little JavaScript, you can follow it.

> **How to read this guide**
> - Part 1–3: the big picture (what the app is, the tools it uses, and how the folders are laid out).
> - Part 4–7: the **backend** (the server), layer by layer.
> - Part 8: every API endpoint in one table.
> - Part 9: **step-by-step flows** for each feature (register, login, submit code, ...). This is the most useful part.
> - Part 10–11: the **frontend** (the website in the browser).
> - Part 12–14: helper scripts, how to run it, and a glossary of terms.

---

## Table of contents

1. [What is CodeHub?](#1-what-is-codehub)
2. [The technology stack (and what each tool does)](#2-the-technology-stack)
3. [Folder structure: every file explained](#3-folder-structure)
4. [Backend architecture: the layered design](#4-backend-architecture)
5. [How the server starts](#5-how-the-server-starts)
6. [The database models (MongoDB)](#6-the-database-models)
7. [Redis: what is stored there and why](#7-redis)
8. [Every API endpoint](#8-every-api-endpoint)
9. [Feature flows, step by step](#9-feature-flows)
10. [Frontend architecture](#10-frontend-architecture)
11. [Frontend flows, step by step](#11-frontend-flows)
12. [Helper scripts](#12-helper-scripts)
13. [How to run the project locally](#13-how-to-run-the-project)
14. [Glossary](#14-glossary)

---

## 1. What is CodeHub?

CodeHub is a **LeetCode-style coding practice platform**. In plain words:

- People **sign up** and **log in**.
- They see a **list of coding problems** (for example "Two Sum", "Valid Parentheses").
- They write a solution in a language (JavaScript, Python, Java, C++ or C) and either:
  - **Run** it: the code is tested against the *example* test cases they can see, or
  - **Submit** it: the code is tested against *all* test cases, including secret ("hidden") ones. If every test passes, the problem is marked **solved** for that user.
- **Admins** (special users) can create, edit and delete problems.
- Each user has a **profile** with statistics (problems solved, acceptance rate, languages used).

The project has two separate apps that talk to each other over HTTP:

```
┌──────────────────────────┐        HTTP (JSON)         ┌───────────────────────────┐
│  FRONTEND (React)        │  ───────────────────────▶  │  BACKEND (Express/Node)   │
│  runs in the browser     │  ◀───────────────────────  │  runs on your machine     │
│  http://localhost:5173   │                            │  http://localhost:3200    │
└──────────────────────────┘                            └─────────────┬─────────────┘
                                                                      │
                                    ┌─────────────────────────────────┼──────────────────────────┐
                                    ▼                                 ▼                          ▼
                           ┌─────────────────┐              ┌──────────────────┐        ┌──────────────────┐
                           │ MongoDB (cloud) │              │ Redis (cloud)    │        │ Judge0 CE        │
                           │ users, problems,│              │ tokens, OTPs,    │        │ (public API that │
                           │ submissions     │              │ rate-limit counts│        │  runs user code) │
                           └─────────────────┘              └──────────────────┘        └──────────────────┘
```

> **Current state of the UI:** the frontend has **Sign up, Log in, the Problem list (home page)** and the **Problem page** (description, Monaco code editor, Run/Submit, results, submission history) and the **Profile page** `/u/:username` (stats, heatmap, recent AC, edit profile, change password). Email verification and admin screens exist only in the backend so far (use Postman or `backend/test-demo.js`).

---

## 2. The technology stack

### Backend (`backend/`)

| Tool | What it is | What CodeHub uses it for |
|---|---|---|
| **Node.js** | Lets you run JavaScript outside the browser | Runs the server |
| **Express 5** | A small framework for building web servers | Defines URLs ("routes") like `/api/auth/login` and what happens when they are called |
| **MongoDB** + **Mongoose 9** | MongoDB is a database that stores JSON-like "documents". Mongoose is a library that lets you describe the shape of those documents ("schemas") in JS | Stores users, problems and submissions permanently |
| **Redis** (`redis` v6 client) | A very fast in-memory key/value store | Stores short-lived data: refresh tokens, a logout "blacklist", email OTP codes, rate-limit counters |
| **jsonwebtoken (JWT)** | Creates signed tokens that prove who you are | Access tokens (15 min) and refresh tokens (7 days) |
| **bcrypt** | Password hashing library | Passwords are never stored in plain text; only a hash is stored |
| **zod** | Validation library | Checks that request bodies have the right fields and formats |
| **cookie-parser** | Reads cookies from requests | Reads the `refreshToken` cookie |
| **cors** | Allows a website on another origin to call the API | Allows `http://localhost:5173` (the frontend) to call the backend |
| **nodemailer** | Sends emails | Sends the email verification code (falls back to printing it in the console if email isn't configured) |
| **dotenv** | Loads variables from a `.env` file into `process.env` | Secrets like database URL and JWT keys |
| **BullMQ** (+ **ioredis**) | A job queue library that stores jobs in Redis | Submissions are put in a queue and judged in the background by a worker, so the submit request returns instantly |
| **Judge0 CE** (external service, no npm package) | A public online "code runner" | Actually compiles and runs the user's code safely, then returns the output |

### Frontend (`Frontend/`)

| Tool | What it is | What CodeHub uses it for |
|---|---|---|
| **React 19** | A library for building UIs out of components | All pages and components |
| **Vite 8** | A development server and bundler | `npm run dev` starts the site on port 5173 with instant reload |
| **React Router 7** | Maps URLs to pages | `/`, `/login`, `/signup` |
| **Redux Toolkit** + **react-redux** | A global "store" for app-wide data | Holds who is logged in, the access token, and the profile |
| **axios** | A library for making HTTP requests | Calls the backend; automatically attaches the token and refreshes it when it expires |
| **react-hook-form** + **zod** + **@hookform/resolvers** | Form handling + validation | Login and Signup forms |
| **Monaco** via **@monaco-editor/react** | The code editor from VS Code, as a React component | The code editor on the problem page. Monaco itself is downloaded from a CDN (jsDelivr) when the page opens |
| **react-resizable-panels** (v4: `Group`, `Panel`, `Separator`) | Draggable split panes | Description \| editor, and editor / console splits on the problem page |
| **Tailwind CSS 4** (+ daisyUI plugin) | Utility CSS classes like `flex`, `p-4` | Styling |
| **oxlint** | A fast linter | Finds code problems (`npm run lint`) |

---

## 3. Folder structure

Below is every meaningful file. `node_modules/` (downloaded libraries) and `dist/` (built output) are left out.

```
Codehub/
├── package.json, package-lock.json, node_modules/   ← root-level install (frontend libraries installed here by mistake; not used by either app)
├── .vscode/settings.json                            ← editor setting: don't warn about Tailwind's @plugin/@import
│
├── backend/                                         ← THE SERVER
│   ├── .env                                         ← secrets: PORT, DB_URI, JWT_KEY, REFRESH_KEY, REDIS_KEY (never share this)
│   ├── package.json                                 ← backend dependencies + scripts (npm start / npm run dev)
│   ├── readme.txt                                   ← old personal notes about admin registration
│   ├── jatin.txt                                    ← notes about Judge0 (an older copy of Documentation_CodeHub.md)
│   ├── Documentation_CodeHub.md                     ← notes + interview Q&A about the Judge0 design
│   ├── codehub_architecture.html                    ← a standalone HTML architecture/interview page
│   ├── test-demo.js                                 ← a manual end-to-end "smoke test" script that calls the real API
│   └── src/
│       ├── index.js                                 ← ENTRY POINT: creates the Express app, plugs in routes, connects DB + Redis, starts listening
│       ├── config/
│       │   ├── databaseConnect.js                   ← connects Mongoose to MongoDB
│       │   ├── redis.config.js                      ← creates the Redis client (host/port come from .env)
│       │   └── bullmq.config.js                     ← Redis connection settings used by BullMQ
│       ├── queues/
│       │   └── submission.queue.js                  ← the "submissions" job queue (retries, cleanup settings)
│       ├── workers/
│       │   └── submission.worker.js                 ← takes jobs off the queue and judges them (runs inside the API process)
│       ├── routes/                                  ← "which URL goes to which function"
│       │   ├── auth.routes.js                       ← /api/auth/...
│       │   ├── problem.routes.js                    ← /api/problems/...
│       │   ├── execution.routes.js                  ← /api/execution/...
│       │   └── user.routes.js                       ← /api/user/...
│       ├── middleware/                              ← functions that run BEFORE the controller
│       │   ├── auth.middleware.js                   ← checks the access token (authMiddleware) and admin role (adminAuthMiddleware)
│       │   └── rateLimiter.middleware.js            ← limits how often someone can call an endpoint (uses Redis)
│       ├── controllers/                             ← read the HTTP request, call a service, send the HTTP response
│       │   ├── userAuth.controller.js               ← register, login, logout, refresh, admin register, delete profile
│       │   ├── problem.controller.js                ← create/update/delete/get problems
│       │   ├── execution.controller.js              ← run code, submit code, list submissions
│       │   ├── userProfile.controller.js            ← my profile, public profile, update profile, change password
│       │   └── emailVerification.controller.js      ← send OTP, verify OTP
│       ├── services/                                ← the real BUSINESS LOGIC (talks to DB, Redis, Judge0)
│       │   ├── auth.service.js
│       │   ├── problem.service.js
│       │   ├── execution.service.js
│       │   ├── user.service.js
│       │   └── emailVerification.service.js
│       ├── models/                                  ← shapes of the data stored in MongoDB
│       │   ├── user.js
│       │   ├── Problem.js
│       │   └── Submission.js
│       └── utils/                                   ← small reusable helpers
│           ├── appError.js                          ← custom error classes that carry an HTTP status code
│           ├── generateToken.js                     ← create/verify JWTs
│           ├── hashing.js                           ← bcrypt hash/compare
│           ├── validateReqBody.js                   ← all zod validation schemas
│           ├── pistonApi.js                         ← talks to Judge0 (name says "piston" for historical reasons)
│           ├── sendEmail.js                         ← sends email or prints a "mock email" to the console
│           ├── seedProblems.js                      ← ONE-OFF SCRIPT: inserts 20 sample problems
│           ├── updateCppStarterCode.js              ← ONE-OFF SCRIPT: adds C++ starter code to those problems
│           └── updateCppReferenceSolution.js        ← ONE-OFF SCRIPT: adds C++ reference solutions
│
└── Frontend/                                        ← THE WEBSITE
    ├── index.html                                   ← the single HTML page; React mounts into <div id="root">
    ├── vite.config.js                               ← Vite setup: React plugin + Tailwind plugin
    ├── package.json                                 ← frontend dependencies + scripts (dev, build, lint, preview)
    ├── .oxlintrc.json                               ← linter rules
    ├── public/                                      ← static files served as-is (favicon.svg, icons.svg)
    └── src/
        ├── main.jsx                                 ← ENTRY POINT: wraps <App/> with Redux <Provider> and <BrowserRouter>
        ├── App.jsx                                  ← checks login on startup, defines the routes /, /login, /signup
        ├── index.css                                ← loads Tailwind + daisyUI
        ├── api/
        │   ├── axios.js                             ← the configured HTTP client (adds token, auto-refreshes on 401)
        │   ├── refresh.js                           ← one shared /auth/refresh call (avoids refresh races) + API base URL
        │   └── execution.js                         ← problem-page API calls: fetch problem, run, submit, poll verdict
        ├── constants/
        │   ├── languages.js                         ← the 5 languages, fallback code templates, getStarterCode()
        │   └── problem.js                           ← difficulty/verdict colors, runtime/memory formatting
        ├── utils/storage.js                         ← localStorage helpers that never throw
        ├── store/
        │   ├── store.js                             ← creates the Redux store
        │   └── slices/authSlice.js                  ← login state + async actions checkAuth / fetchUserProfile / logoutUser
        ├── pages/
        │   ├── login.jsx                            ← Sign In page
        │   ├── signup.jsx                           ← Create Account page
        │   ├── homepage.jsx                         ← Problem list page (after login)
        │   ├── problem.jsx                          ← Problem page /problems/:problemId (lazy-loaded)
        │   └── profile.jsx                          ← Profile page /u/:username
        ├── components/
        │   ├── Navbar.jsx                           ← top bar: logo, tabs, avatar dropdown, sign out
        │   ├── CodeHubLogo.jsx                      ← the logo
        │   ├── ProblemFilters.jsx                   ← search box + difficulty/status dropdowns
        │   ├── ProblemTable.jsx                     ← the table of problems
        │   ├── Pagination.jsx                       ← Prev / 1 2 3 / Next
        │   ├── SettingsModal.jsx                    ← "Account Settings" popup (read-only)
        │   ├── profile/                             ← pieces of the profile page
        │   │   ├── ProfileSidebar.jsx               ← avatar, name, rank, bio, joined date, languages, skills
        │   │   ├── SolvedProgressCard.jsx           ← solved ring (easy/medium/hard arcs) + solved/total bars
        │   │   ├── SubmissionStatsCard.jsx          ← acceptance rate, totals, verdict breakdown
        │   │   ├── SubmissionHeatmap.jsx            ← one-year activity grid, active days, max streak
        │   │   ├── RecentAcList.jsx                 ← last 15 accepted submissions
        │   │   └── EditProfileModal.jsx             ← "Profile" tab (name, bio, avatar, languages) + "Password" tab
        │   └── problem/                             ← pieces of the problem page
        │       ├── ProblemHeader.jsx                ← top bar: logo, "Problem List", Run / Submit buttons
        │       ├── ProblemDescription.jsx           ← title, difficulty, tags, statement, examples, constraints
        │       ├── SubmissionsList.jsx              ← your past submissions; expand to see code / load it into the editor
        │       ├── CodeEditorPanel.jsx              ← language dropdown, Reset, Monaco editor (+ keyboard shortcuts)
        │       └── ConsolePanel.jsx                 ← "Testcase" and "Test Result" tabs
        └── assets/                                  ← images from the Vite template (currently unused)
```

---

## 4. Backend architecture

### 4.1 The layered ("onion") design

The backend follows a common pattern: **Route → Middleware → Controller → Service → Model/Redis/Judge0**. Each layer has one job.

```
          HTTP request  (e.g. POST /api/execution/submit)
                │
                ▼
   ┌────────────────────────────┐
   │ index.js (global setup)    │  express.json() → parse the JSON body into req.body
   │                            │  cookieParser() → parse cookies into req.cookies
   │                            │  cors()         → allow the frontend origin
   └────────────┬───────────────┘
                ▼
   ┌────────────────────────────┐
   │ ROUTE  (routes/*.js)       │  "POST /submit → authMiddleware, submitCodeLimiter, submitCode"
   └────────────┬───────────────┘
                ▼
   ┌────────────────────────────┐
   │ MIDDLEWARE                 │  authMiddleware: is the token valid? → sets req.user
   │ (middleware/*.js)          │  rateLimiter:    too many requests? → 429
   └────────────┬───────────────┘
                ▼
   ┌────────────────────────────┐
   │ CONTROLLER                 │  takes req.body / req.params / req.user,
   │ (controllers/*.js)         │  calls the service, turns the result (or error) into res.status(...).json(...)
   └────────────┬───────────────┘
                ▼
   ┌────────────────────────────┐
   │ SERVICE                    │  validates input with zod, applies business rules,
   │ (services/*.js)            │  reads/writes MongoDB, Redis, calls Judge0.
   │                            │  On a problem it THROWS an AppError (e.g. NotFoundError → 404)
   └────────────┬───────────────┘
                ▼
   ┌──────────────┬──────────────┬──────────────┐
   │ MODELS       │ REDIS        │ UTILS        │
   │ (Mongoose)   │ client       │ (JWT, bcrypt,│
   │              │              │  Judge0 ...) │
   └──────────────┴──────────────┴──────────────┘
```

**Why split it like this?**
- *Routes* are a table of contents: you can see the whole API at a glance.
- *Middleware* is reusable "gatekeeping" (auth, rate limiting) that many routes share.
- *Controllers* only know about HTTP (status codes, cookies, JSON). They don't know about databases.
- *Services* only know about business rules. They don't know about HTTP, which makes them easier to reuse and test.

### 4.2 How errors travel back to the user

1. A service detects a problem, e.g. "user not found", and does `throw new NotFoundError("User not found")`.
2. `NotFoundError` (in [backend/src/utils/appError.js](backend/src/utils/appError.js)) is a JavaScript `Error` with an extra `statusCode = 404` (and optionally `details`).
3. The controller's `try/catch` catches it and replies `res.status(error.statusCode || 500).json({ error: error.message })`.
4. Any *unexpected* error (database down, bug) has no `statusCode`, so it becomes a **500**.

Available error classes:

| Class | HTTP status | Typical use |
|---|---|---|
| `BadRequestError(message, details)` | 400 | invalid body, wrong OTP, wrong password |
| `UnauthorizedError` | 401 | missing/invalid refresh token |
| `ForbiddenError` | 403 | (defined but not used yet) |
| `NotFoundError` | 404 | problem/user doesn't exist |
| `ConflictError` | 409 | problem ID already exists |

### 4.3 How a service validates input (zod)

Every service that accepts a request body does this first:

```js
const validation = someSchema.safeParse(payload);   // check the shape
if (!validation.success) {
    throw new BadRequestError("Invalid request body", validation.error.issues);  // 400 + list of problems
}
const cleanData = validation.data;                   // safe, typed data
```

All schemas live in [backend/src/utils/validateReqBody.js](backend/src/utils/validateReqBody.js):

| Schema | Used by | Key rules |
|---|---|---|
| `userValidation` | register, admin register | firstName ≥3 chars, username 3–20, valid email, password 8–32 chars with upper, lower, digit and special char, `confirmPassword` must match |
| `createProblemValidation` | create problem | numeric `problemID`, title, description, difficulty (`easy/medium/hard`), tags from a fixed list, ≥1 visible and ≥1 hidden test case, reference solution, starter code |
| `updateProblemValidation` | update problem | same as create but every field optional and `problemID` can't change |
| `executionValidation` | run, submit | `problemId` (number or string), `language` (`javascript/python/java/cpp/c`), `code` non-empty |
| `changePasswordValidation` | change password | old + new password with same complexity rules, confirm must match new |

### 4.4 Authentication design (the most important concept)

CodeHub uses **two tokens**:

| | Access token | Refresh token |
|---|---|---|
| What | A JWT signed with `JWT_KEY` | A JWT signed with `REFRESH_KEY` |
| Lifetime | **15 minutes** | **7 days** |
| Where the browser keeps it | In **Redux memory** (lost on page reload) | In an **HttpOnly cookie** named `refreshToken` (JavaScript can't read it, which protects it from XSS) |
| How it's sent | `Authorization: Bearer <token>` header | Automatically by the browser with every request to the backend (because of `withCredentials: true`) |
| Where the server remembers it | Not stored. It is self-proving (signature). On logout it's added to a Redis **blacklist** until it would have expired anyway | Stored in Redis at `refreshToken:<userId>`. Only the **latest** one is valid (**Refresh Token Rotation**) |
| Contents (payload) | `{ id, email, username, role, iat, exp }` | same |

Why two tokens? Short-lived access tokens limit the damage if one is stolen. The long-lived refresh token lets the user stay logged in for a week without typing their password, and because it's stored in Redis the server can revoke it (logout, password change).

**Refresh Token Rotation (RTR):** every time `/api/auth/refresh` is used, the server issues a **new** refresh token and overwrites the one in Redis. If an old refresh token is ever presented again it won't match Redis and is rejected.

**One session per user:** because Redis stores only one refresh token per user ID (`refreshToken:<userId>`), logging in on a second device overwrites the first device's refresh token. The first device keeps working until its 15-minute access token expires, then it gets logged out.

### 4.5 The two auth middlewares

File: [backend/src/middleware/auth.middleware.js](backend/src/middleware/auth.middleware.js)

`authMiddleware` (used on any "must be logged in" route):
1. Read the `Authorization` header. If it's missing or doesn't start with `Bearer ` → **401**.
2. Take the token after `Bearer `.
3. Ask Redis: does `blacklist:<token>` exist? (i.e. was this token logged out?) If yes → **401 "Token has been revoked"**.
4. Verify the JWT signature and expiry with `JWT_KEY`. If invalid/expired → **401**.
5. Put the decoded payload on `req.user` (so controllers can use `req.user.id`) and the raw token on `req.token`.
6. Call `next()` → go to the next middleware/controller.

`adminAuthMiddleware` does exactly the same **plus** checks `decoded.role === 'admin'`; otherwise → **403 Forbidden**.

### 4.6 The rate limiter

File: [backend/src/middleware/rateLimiter.middleware.js](backend/src/middleware/rateLimiter.middleware.js)

A "fixed window counter" stored in Redis:

1. Identify the caller: `req.user.id` if logged in, otherwise their IP.
2. Key = `ratelimit:<prefix>:<identifier>`, e.g. `ratelimit:submit:64f...`.
3. `INCR` the key (adds 1; creates it at 1 if missing).
4. If the value is now 1 (first request in this window), set an expiry of `windowSeconds`.
5. Add headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
6. If the count is above the limit → **429 Too Many Requests** with `Retry-After`.
7. If Redis fails, it lets the request through ("fail open") so users aren't blocked by an outage.

Pre-built limiters:

| Limiter | Limit | Window | Used on |
|---|---|---|---|
| `runCodeLimiter` | 3 | 60 s | `POST /api/execution/run` |
| `submitCodeLimiter` | 3 | 60 s | `POST /api/execution/submit` |
| `sendVerifyEmailLimiter` | 10 | 15 min | `POST /api/user/send-verify-email` |
| `verifyEmailLimiter` | 5 | 15 min | `POST /api/user/verify-email` |

---

## 5. How the server starts

File: [backend/src/index.js](backend/src/index.js). Running `npm run dev` (uses `nodemon`, restarts on file changes) or `npm start` executes this file top to bottom:

1. `require('express')`, then `require("dotenv").config()` loads `backend/.env` into `process.env`.
2. Imports every router and the Redis client. (Creating the Redis client does **not** connect yet.)
3. `const app = express()` creates the app.
4. Registers global middleware, in order:
   - `express.json()`: turns a JSON request body into `req.body`.
   - `cookieParser()`: turns the `Cookie` header into `req.cookies`.
   - `cors({ origin: "http://localhost:5173", credentials: true })`: lets the React dev server call the API and send cookies.
5. Mounts routers under prefixes:
   - `/api/auth` → `auth.routes.js`
   - `/api/problems` → `problem.routes.js`
   - `/api/execution` → `execution.routes.js`
   - `/api/user` → `user.routes.js`
6. `connection()` runs `dbConnect()` and `redisClient.connect()` **in parallel** with `Promise.all`, prints "Connected to both database and redis". If either fails, the process exits.
7. Starts the **submission worker** (`startSubmissionWorker()`), which begins listening for queued submissions.
8. `app.listen(process.env.PORT)` (port **3200**).
9. Registers shutdown handlers for `SIGTERM`/`SIGINT` (Ctrl+C or a hosting platform redeploying): stop accepting requests, let the worker finish its current job, then close the queue, Redis and MongoDB.

---

## 6. The database models

MongoDB stores **collections** of **documents**. Mongoose **models** describe them.

```
┌────────────────────────────┐          ┌──────────────────────────────┐
│ users                      │          │ problems                     │
│ _id                        │◀─────────│ problemCreator (user _id)    │
│ firstName, lastName, age   │          │ _id                          │
│ username (unique)          │          │ problemID (1, 2, 3 … unique) │
│ email (unique, immutable)  │          │ title, description           │
│ password (bcrypt hash)     │          │ difficulty, tags, constraints│
│ role: user | admin         │          │ visibleTestCases[]           │
│ problemsSolved[] ──────────┼────────▶ │ hiddenTestCases[]            │
│ profile { avatar, bio }    │          │ timeLimit, memoryLimit       │
│ isVerified, isActive       │          │ referenceSolution(s)         │
│ languagePreferences[]      │          │ starterCode(s)               │
│ createdAt, updatedAt       │          └──────────────▲───────────────┘
└─────────────▲──────────────┘                         │
              │                                        │
              │      ┌──────────────────────────────┐  │
              └──────│ submissions                  │──┘
                     │ userId      → users._id      │
                     │ problemId   → problems._id   │
                     │ language, code               │
                     │ verdict                      │
                     │ testCasesPassed/totalTestCases│
                     │ executionTime, memory        │
                     │ errorMessage                 │
                     │ createdAt, updatedAt         │
                     └──────────────────────────────┘
```

### 6.1 `user` — [backend/src/models/user.js](backend/src/models/user.js)

| Field | Type | Notes |
|---|---|---|
| `firstName` | String, required | 3–20 chars |
| `lastName` | String | 3–20 chars, optional |
| `age` | Number | 6–100, optional |
| `username` | String, required, **unique** | trimmed, 3–20 chars; used in public profile URLs |
| `email` | String, required, **unique** | lowercased, **immutable** (can never change) |
| `password` | String, required | the **bcrypt hash**, not the real password |
| `role` | `'user'` or `'admin'` | default `'user'` |
| `problemsSolved` | array of Problem `_id`s | filled when a submission is Accepted (`$addToSet` prevents duplicates) |
| `profile.avatar` | String | defaults to a generic avatar image URL |
| `profile.bio` | String | max 200 chars |
| `isVerified` | Boolean | becomes `true` after email OTP verification |
| `isActive` | Boolean | default `true` (not used anywhere yet) |
| `languagePreferences` | array of String | free-form |
| `createdAt`, `updatedAt` | Date | automatic (`timestamps: true`) |

Exported as `module.exports = { user }`, so it's imported with `const { user } = require("../models/user")`.

### 6.2 `Problem` — [backend/src/models/Problem.js](backend/src/models/Problem.js)

| Field | Notes |
|---|---|
| `problemID` | Human-friendly number (1, 2, 3...). **Unique.** URLs can use this *or* the Mongo `_id` |
| `title`, `description` | The problem statement |
| `difficulty` | `easy` / `medium` / `hard` |
| `tags` | from a fixed list (arrays, strings, dynamic programming, trees, ...) |
| `visibleTestCases[]` | `{ input, output, explanation }`: shown to users, used by **Run** |
| `hiddenTestCases[]` | `{ input, output }`: secret, used by **Submit** only |
| `constraints[]` | text lines like `"2 <= nums.length <= 10^4"` |
| `timeLimit` | seconds (default 1.0) |
| `memoryLimit` | MB (default 256) |
| `referenceSolution` | `{ language, completeCode }`: the "official" answer (one language) |
| `referenceSolutions[]` | the same idea but for multiple languages |
| `starterCode` | `{ language, code }`: the template users start from (one language) |
| `starterCodes[]` | the same for multiple languages |
| `problemCreator` | the admin's user `_id` |

**How test cases work (important):** CodeHub programs read from **standard input (stdin)** and print to **standard output (stdout)**. For "Two Sum", the input text is:

```
4 9
2 7 11 15
```

(first line: array length and target; second line: the numbers). The program must print exactly `0 1`. The judge compares the trimmed printed output with the trimmed expected output.

### 6.3 `Submission` — [backend/src/models/Submission.js](backend/src/models/Submission.js)

| Field | Notes |
|---|---|
| `userId`, `problemId` | who submitted, for which problem |
| `language`, `code` | what they submitted |
| `verdict` | `Pending` → then one of `Accepted`, `Wrong Answer`, `Time Limit Exceeded`, `Runtime Error`, `Compilation Error` |
| `testCasesPassed` / `totalTestCases` | e.g. 4 / 5 |
| `executionTime` | the **slowest** test case time, in seconds |
| `memory` | the **highest** memory used, in KB |
| `errorMessage` | compiler/runtime error text if any |
| `createdAt`, `updatedAt` | automatic |

---

## 7. Redis

Redis is used for data that is **temporary** and needs to be **fast**. Every key has an expiry, so Redis cleans itself up.

| Key pattern | Value | Expires after | Written by | Read by |
|---|---|---|---|---|
| `refreshToken:<userId>` | the current valid refresh token | 7 days | register, login, refresh, change password | `/api/auth/refresh` |
| `blacklist:<accessToken>` | `"true"` | the token's remaining lifetime (≤15 min) | logout, delete account | `authMiddleware` / `adminAuthMiddleware` |
| `email_otp:<userId>` | 6-digit code | 10 min | send-verify-email | verify-email |
| `email_cooldown:<userId>` | `"true"` | 60 s | send-verify-email | send-verify-email |
| `ratelimit:<prefix>:<userId or IP>` | a counter | the limiter's window | rate limiter | rate limiter |
| `bull:submissions:*` | BullMQ's own job/queue data (each job only holds a `submissionId`) | finished jobs are trimmed to the last 100 | submission queue | submission worker |

> The Redis database's **eviction policy must be `noeviction`** (set in the Redis Cloud console). Otherwise Redis could delete BullMQ's keys when memory is tight.

The Redis server is a hosted Redis Cloud instance (free plan). Host, port and password come from `REDIS_HOST`, `REDIS_PORT` and `REDIS_KEY` in `.env`. Two client libraries connect to it: `redis` (node-redis) for the app's own keys, and `ioredis` (used internally by BullMQ) for the queue.

---

## 8. Every API endpoint

Base URL: `http://localhost:3200`. "Auth" means you must send `Authorization: Bearer <accessToken>`.

### Auth: `/api/auth` ([auth.routes.js](backend/src/routes/auth.routes.js))

| Method | URL | Who | Body | Returns |
|---|---|---|---|---|
| POST | `/api/auth/register` | anyone | `firstName, lastName?, age?, username, email, password, confirmPassword` | `201 { accessToken }` + sets `refreshToken` cookie |
| POST | `/api/auth/login` | anyone | `identifier` (email **or** username), `password` | `200 { accessToken, user }` + cookie |
| POST | `/api/auth/logout` | Auth | none | `200`, blacklists the access token, deletes refresh token, clears cookie |
| POST | `/api/auth/refresh` | anyone with the cookie | none (uses the cookie) | `200 { accessToken, user }` + **new** cookie |
| POST | `/api/auth/admin/register` | Admin | same as register | `201 { message, admin }` (no tokens; new admin must log in) |
| DELETE | `/api/auth/profile` | Auth | none | deletes the user + all their submissions, logs them out |

### Problems: `/api/problems` ([problem.routes.js](backend/src/routes/problem.routes.js))

`:id` can be the Mongo `_id` **or** the numeric `problemID`.

| Method | URL | Who | Purpose |
|---|---|---|---|
| GET | `/api/problems` (alias `/list`) | anyone | Paginated list. Query: `page`, `limit`, `difficulty`, `tags` (comma-separated), `search` (title contains) |
| GET | `/api/problems/:id` (alias `/get/:id`) | anyone | One problem, without hidden test cases and without `referenceSolution` |
| GET | `/api/problems/:id/submissions` | Auth | My submissions for that problem |
| GET | `/api/problems/user` | Auth | Problems created by me (meant for admins) |
| GET | `/api/problems/solved` | Auth | Problems I have solved + easy/medium/hard counts |
| POST | `/api/problems` (alias `/create`) | Admin | Create a problem |
| PATCH | `/api/problems/:id` (alias `/update/:id`) | Admin | Edit a problem |
| DELETE | `/api/problems/:id` (alias `/delete/:id`) | Admin | Delete a problem |

> Route order matters in Express: `/user` and `/solved` are declared **before** `/:id`, otherwise Express would think "user" is an `:id`.

### Execution: `/api/execution` ([execution.routes.js](backend/src/routes/execution.routes.js))

| Method | URL | Who | Body | Purpose |
|---|---|---|---|---|
| POST | `/api/execution/run` | Auth, max 3/min | `problemId, language, code` | Test against **visible** test cases. Nothing is saved |
| POST | `/api/execution/submit` | Auth, max 3/min | `problemId, language, code` | Saves a `Pending` Submission, queues it, returns **202** `{ submissionId, verdict: "Pending", totalTestCases }` immediately |
| GET | `/api/execution/result/:submissionId` | Auth (owner only) | | Current verdict of one submission. Poll this until `verdict` isn't `Pending` |
| GET | `/api/execution/submissions/:pId` | Auth | | My submissions for a problem (same as `/api/problems/:id/submissions`) |

### User: `/api/user` ([user.routes.js](backend/src/routes/user.routes.js))

| Method | URL | Who | Purpose |
|---|---|---|---|
| POST | `/api/user/send-verify-email` | Auth, 10 / 15 min | Email me a 6-digit code |
| POST | `/api/user/verify-email` | Auth, 5 / 15 min | Body `{ otp }`: confirm the code |
| GET | `/api/user/profile` | Auth | My full profile (public data + email etc.) |
| PUT | `/api/user/profile` | Auth | Update `firstName, lastName, bio, avatar, languagePreferences` |
| PATCH | `/api/user/profile/change-password` | Auth | Body `{ oldPassword, newPassword, confirmPassword }` |
| GET | `/api/user/:username` | anyone | Public profile + stats (declared **last** so it doesn't swallow `/profile`) |

---

## 9. Feature flows

Each flow lists the exact files and what happens in order.

### 9.1 Register (sign up)

```
Browser (signup.jsx)                Backend                                   MongoDB        Redis
   │ POST /api/auth/register          │                                           │             │
   │ {firstName,...,confirmPassword}  │                                           │             │
   │─────────────────────────────────▶│ auth.routes → registerUser (controller)   │             │
   │                                  │ authService.register(body)                │             │
   │                                  │  1. zod userValidation                    │             │
   │                                  │  2. drop confirmPassword, force role=user │             │
   │                                  │  3. bcrypt hash password                  │             │
   │                                  │  4. user.create(...) ────────────────────▶│ insert      │
   │                                  │  5. generateToken(payload) → access+refresh             │
   │                                  │  6. SET refreshToken:<id> (7d) ─────────────────────────▶│
   │◀─────────────────────────────────│ 201 {accessToken} + Set-Cookie refreshToken             │
   │ navigate("/login", {registered}) │                                                         │
```

1. **Frontend** ([Frontend/src/pages/signup.jsx](Frontend/src/pages/signup.jsx)): `react-hook-form` + a zod schema validate as you type. The password strength bar shows which rules pass. On submit, it calls `api.post("/auth/register", {...})`.
2. **Route** `POST /register` → `registerUser` in [userAuth.controller.js](backend/src/controllers/userAuth.controller.js).
3. **Service** `authService.register` in [auth.service.js](backend/src/services/auth.service.js):
   - Validates with `userValidation`.
   - Removes `confirmPassword`, forces `role = "user"` (so nobody can make themselves admin), `isVerified = false`.
   - Hashes the password with bcrypt (10 salt rounds).
   - Saves the user. Duplicate username/email makes MongoDB throw an error.
   - Creates an access + refresh token and stores the refresh token in Redis.
4. **Controller** sets the `refreshToken` cookie (HttpOnly, 7 days) and responds `201 { accessToken }`.
5. **Frontend** ignores the token and redirects to `/login`, which shows "Account created successfully! Please sign in."

### 9.2 Login

1. **Frontend** ([login.jsx](Frontend/src/pages/login.jsx)) sends `POST /api/auth/login` with `{ identifier, password }`.
2. **Service** `authService.login`:
   - If `identifier` looks like an email, find by `email`; otherwise find by `username`.
   - If no user, or `bcrypt.compare` fails → **400 "Invalid Credentials"** (same message either way so attackers can't tell which part was wrong).
   - Generate tokens, store the refresh token in Redis (overwriting any previous one).
3. **Controller** sets the cookie and responds `{ accessToken, user: { id, email, username, role } }`.
4. **Frontend** dispatches `setCredentials({ user, accessToken })` into Redux, so `isAuthenticated` becomes `true`, then `navigate("/")`.

### 9.3 Staying logged in after a page reload (`checkAuth`)

Because the access token lives only in memory, reloading the page loses it. The refresh cookie survives, so:

1. On startup, [App.jsx](Frontend/src/App.jsx) dispatches `checkAuth()` ([authSlice.js](Frontend/src/store/slices/authSlice.js)).
2. While it runs, `isLoading` is `true` and App shows a spinner.
3. `checkAuth` calls `POST http://localhost:3200/api/auth/refresh` with `withCredentials: true`, so the browser sends the `refreshToken` cookie.
4. **Backend** `authService.refreshTokens`:
   - Verify the refresh JWT with `REFRESH_KEY`.
   - Compare with `refreshToken:<userId>` in Redis. Must be **identical** (rotation check).
   - Load the user from MongoDB (so a role change takes effect here).
   - Generate a new pair, store the new refresh token in Redis, set the new cookie.
5. **Frontend**: if successful → `isAuthenticated = true`, store `user` + `accessToken`. If it fails → `isAuthenticated = false`.
6. App's routes then decide: authenticated users see `/` (Homepage); others are redirected to `/login`.

### 9.4 Automatic token refresh when the access token expires

Every request goes through [Frontend/src/api/axios.js](Frontend/src/api/axios.js):

```
api.get("/problems")
   │
   ├─ request interceptor: add  Authorization: Bearer <accessToken from Redux>
   │
   ▼
backend replies 401 (token expired after 15 min)
   │
   ├─ response interceptor:
   │     if 401 and this request hasn't been retried yet:
   │        mark original._retry = true
   │        POST /api/auth/refresh   (plain axios, so this call doesn't loop through the interceptor)
   │        ├─ success → save new token in Redux, retry the original request with it
   │        └─ failure → dispatch clearAuth() → user becomes logged out → App redirects to /login
   ▼
caller gets the data as if nothing happened
```

### 9.5 Logout

1. **Frontend**: Navbar "Sign out" → `dispatch(logoutUser())` → `api.post("/auth/logout")`, then always `clearAuth()` and `navigate("/login")`.
2. **Backend** `authMiddleware` checks the token, then `authService.logout`:
   - Puts `blacklist:<accessToken>` in Redis until that token's natural expiry, so the token can't be reused even though it's still cryptographically valid.
   - Deletes `refreshToken:<userId>` so no refresh is possible.
3. **Controller** clears the cookie and responds 200.

### 9.6 Email verification (OTP)

Backend only (no UI yet). Files: [emailVerification.service.js](backend/src/services/emailVerification.service.js), [sendEmail.js](backend/src/utils/sendEmail.js).

**Send code** (`POST /api/user/send-verify-email`):
1. Auth + rate limiter (10 per 15 min).
2. Load user. Already verified → 400.
3. If `email_cooldown:<id>` exists → 400 "wait 60 seconds".
4. Generate a random 6-digit code with `crypto.randomInt`.
5. Store `email_otp:<id>` (10 min) and `email_cooldown:<id>` (60 s).
6. `sendEmail(...)`: if `EMAIL_USER` / `EMAIL_PASS` are not set in `.env` (currently they are **not**), it prints a "MOCK EMAIL" with the code to the **server console** instead of sending.

**Verify code** (`POST /api/user/verify-email`, body `{ otp }`):
1. Auth + rate limiter (5 per 15 min).
2. Compare the code with `email_otp:<id>`. Missing → "expired"; different → "Invalid".
3. Set `isVerified = true` in MongoDB, delete the Redis keys.

### 9.7 Browsing the problem list

1. **Homepage** ([homepage.jsx](Frontend/src/pages/homepage.jsx)) calls `GET /api/problems?page=1&limit=10[&difficulty=easy][&search=two]`. Typing in the search box waits 300 ms before calling (debounce).
2. **Backend** `problemService.getAllProblems`:
   - Builds a MongoDB filter: `difficulty`, `tags: {$in: [...]}`, `title: {$regex: search, $options: "i"}` (case-insensitive "contains").
   - Runs `find(...).sort({problemID:1}).skip(...).limit(...)` and `countDocuments(...)` **in parallel**.
   - Returns `{ problems: [{_id, problemID, title, difficulty, tags}], pagination: { currentPage, totalPages, totalProblems } }`.
3. Homepage also calls `GET /api/problems/solved` once to get the IDs of solved problems, so the table can show a ✓.
4. The "Status: Solved/Unsolved" filter is applied **in the browser** on the current page only.

### 9.8 Run code (test against examples)

`POST /api/execution/run` with `{ problemId: 1, language: "python", code: "..." }`

```
Client ──▶ authMiddleware ──▶ runCodeLimiter (3/min) ──▶ runCode controller ──▶ executionService.runCode
                                                                                    │
   1. zod executionValidation                                                       │
   2. resolveProblem(problemId): try Mongo _id, else numeric problemID              │
   3. inputs = problem.visibleTestCases.map(tc => tc.input)                         │
   4. executeBatch(language, code, inputs, timeLimit, memoryLimit) ───────────────▶ Judge0
        a. POST https://ce.judge0.com/submissions/batch  (one entry per test case)
        b. receive tokens [t1, t2, ...]
        c. every 1 s (up to 15 times): GET /submissions/batch?tokens=t1,t2,...
           until every result's status.id > 2 (i.e. no longer "In Queue"/"Processing")
   5. If any result has status 6 or compile output → return "Compilation Error"
   6. For each test case:
        status 5            → "Time Limit Exceeded"
        status ≥7 or stderr without stdout → "Runtime Error"
        trimmed stdout == trimmed expected → "Passed", else "Wrong Answer"
   7. respond { totalTests, passed, results: [ {input, expectedOutput, actualOutput, passed, status, time, memory} ] }
```

**Judge0 status IDs used:** 1 In Queue, 2 Processing, 3 Accepted, 4 Wrong Answer, 5 Time Limit Exceeded, 6 Compilation Error, 7–12 various Runtime Errors, 13 Internal Error, 14 Exec Format Error.

**Language → Judge0 ID** ([pistonApi.js](backend/src/utils/pistonApi.js)): javascript 102 (Node 22), python 100 (3.12), java 91 (JDK 17), cpp 105 (GCC 14), c 103 (GCC 14).

### 9.9 Submit code (the real judge, via a queue)

Judging takes several seconds (Judge0 + polling), so it doesn't happen inside the HTTP request. Submit is split into **two parts**: the API puts a job in a **queue**, and a **worker** does the judging in the background.

```
Browser ── POST /execution/submit ──▶ API (submitCode)
                                        1. validate, resolve problem
                                        2. save Submission { verdict: "Pending" }   → MongoDB
                                        3. add job { submissionId } to "submissions" queue → Redis
        ◀── 202 { submissionId, verdict: "Pending" } ── (about half a second)

                       Redis queue ──▶ Worker (submission.worker.js → judgeSubmission)
                                         4. load Submission + Problem from MongoDB
                                         5. send all test cases to Judge0, poll until done
                                         6. compute verdict, save it on the Submission
                                         7. if Accepted → $addToSet into user.problemsSolved

Browser ── GET /execution/result/:submissionId ──▶ { verdict: "Pending" } … then { verdict: "Accepted", ... }
         (repeat every second until verdict is not "Pending")
```

Step by step, in [execution.service.js](backend/src/services/execution.service.js):

1. **`submitCode`** (API side): validates the body, resolves the problem, and **writes first**: it creates a Submission with `verdict: "Pending"` so the user's code is safe in MongoDB.
2. It adds a job to `submissionQueue` ([submission.queue.js](backend/src/queues/submission.queue.js)) with data `{ submissionId }`. The job's ID is the submission ID, so the same submission can never be queued twice. Only the ID goes into Redis, which keeps memory tiny on the free plan.
3. The controller responds **202 Accepted** ("received, still being processed").
4. **The worker** ([submission.worker.js](backend/src/workers/submission.worker.js)) runs in the same Node process as the API. It handles at most **2 jobs at a time** (`concurrency: 2`) and calls **`judgeSubmission(submissionId)`**:
   - If the submission is no longer `Pending` (already judged), it does nothing. This makes retries safe.
   - It sends all test cases (visible + hidden) to Judge0 in one batch and walks the results, starting from `verdict = "Accepted"`:
     - Compilation error (Judge0 status 6) → `Compilation Error`, stop.
     - TLE / runtime error → the **first** such failure sets the verdict; it keeps checking the rest.
     - Output mismatch → `Wrong Answer` (if nothing worse happened earlier).
     - Output match → `testCasesPassed++`.
     - It tracks the max time and max memory.
   - It saves the verdict and, if `Accepted`, adds the problem to `user.problemsSolved` (`$addToSet` = add only if not already there).
5. **If Judge0 or the network fails**, `judgeSubmission` throws and BullMQ **retries** the job: up to 3 attempts, waiting 2 s then 4 s. If every attempt fails, the worker marks the submission **`Internal Error`** ("Judge unavailable, please resubmit") so it never stays Pending forever.
6. **If the server restarts mid-judge**, the job is still in Redis. BullMQ notices it was interrupted ("stalled") and runs it again.
7. The client polls **`GET /api/execution/result/:submissionId`** (`getSubmissionResult`, owner only) until the verdict is no longer `Pending`.

**Why a queue?** The submit request finishes in milliseconds instead of holding a connection open for up to ~16 seconds. Work survives restarts, Judge0 hiccups are retried instead of being blamed on the user's code, and the concurrency limit keeps load on Judge0 and the free Redis plan under control.

### 9.10 Viewing my submissions

`GET /api/execution/submissions/:pId` or `GET /api/problems/:id/submissions` → `executionService.getUserSubmissions` → finds submissions for (me, that problem), newest first, returns `{ totalSubmissions, submissions }`.

### 9.11 Profiles

**Public profile** `GET /api/user/:username` ([user.service.js](backend/src/services/user.service.js) `getPublicProfile`):
1. Find the user by username.
2. Run **three queries in parallel**:
   - An **aggregation** on submissions with `$facet` that, in one pass, computes counts per verdict, accepted counts per language, and overall totals.
   - The last 5 Accepted submissions, with the problem title/difficulty filled in (`populate`).
   - The user's solved problems (for the easy/medium/hard breakdown).
3. Builds a response with identity, solved stats, submission stats (incl. acceptance rate), language stats, and recent activity.

**My profile** `GET /api/user/profile`: loads me, reuses `getPublicProfile(myUsername)`, and adds private fields (`email`, `isActive`, `updatedAt`). The frontend stores this in `state.auth.profile` and shows it in the Navbar dropdown and Settings modal.

The public profile also includes:
- `rank`: 1 + the number of users who solved more problems.
- `solvedStats.totalProblems` and `totalByDifficulty`, for "solved / total".
- `languageStats`: **distinct problems** accepted per language.
- `tagStats`: solved problems per tag, used for "Skills".
- `submissionCalendar`: `{ "YYYY-MM-DD": count }` for the last 365 days, using **UTC** dates.
- `recentAccepted`: the last 15.

`Pending` and `Internal Error` submissions are left out of the acceptance-rate and verdict counts. `GET /api/user/profile` (your own profile) additionally returns `firstName` and `lastName` for the edit form.

**Update profile** `PUT /api/user/profile`: only `firstName`, `lastName`, `bio`, `avatar`, `languagePreferences` can change. It's validated with `updateProfileValidation`: names 3–20 characters, bio up to 200, avatar must be an http(s) URL, languages from the 5 supported ones. An empty `lastName` or `avatar` removes the value (the avatar falls back to the default image).

### 9.12 Change password

`PATCH /api/user/profile/change-password`:
1. Validate `{ oldPassword, newPassword, confirmPassword }`.
2. Check old password with bcrypt; reject if new == old.
3. Save the new hash.
4. Delete the stored refresh token (kills other devices' sessions), then issue and store a fresh pair for this device.
5. Responds with a new `accessToken` and sets a new cookie.

### 9.13 Delete account

`DELETE /api/auth/profile`: deletes the user, deletes all their submissions, blacklists the current access token, deletes the refresh token, clears the cookie.

### 9.14 Admin: create / update / delete a problem

1. Only users with `role: "admin"` pass `adminAuthMiddleware`.
2. **How to get the first admin?** There is no endpoint for it: `/api/auth/admin/register` itself requires an admin. The first admin must be created by editing a user's `role` directly in MongoDB.
3. **Create** (`POST /api/problems`): validate with `createProblemValidation`, reject if `problemID` exists (409), save with `problemCreator = req.user.id`.
4. **Update** (`PATCH /api/problems/:id`): validate partial fields, `findOneAndUpdate` with `runValidators`.
5. **Delete** (`DELETE /api/problems/:id`): `findOneAndDelete`.

---

## 10. Frontend architecture

### 10.1 Startup chain

```
index.html
  └─ <script src="/src/main.jsx">
        main.jsx
          └─ <StrictMode>
               └─ <Provider store={store}>        ← Redux available everywhere
                    └─ <BrowserRouter>            ← URL routing available everywhere
                         └─ <App />
                              ├─ useEffect → dispatch(checkAuth())   (try to restore session)
                              ├─ while isLoading → spinner
                              └─ <Routes>
                                   ├─ "/"       → isAuthenticated ? <Homepage/> : redirect /login
                                   ├─ "/problems/:problemId" → isAuthenticated ? <ProblemPage/> (lazy) : redirect /login
                                   ├─ "/login"  → isAuthenticated ? redirect / : <Login/>
                                   └─ "/signup" → isAuthenticated ? redirect / : <Signup/>
```

### 10.2 Global state (Redux): `state.auth`

Defined in [authSlice.js](Frontend/src/store/slices/authSlice.js):

| Field | Meaning |
|---|---|
| `user` | `{ id, email, username, role }` from login/refresh |
| `profile` | the big object from `GET /api/user/profile` (name, avatar, solvedStats, ...) |
| `accessToken` | the 15-minute JWT (memory only, never in localStorage) |
| `isAuthenticated` | true when we have a token |
| `isLoading` | true until the first `checkAuth` finishes |
| `error` | last auth error message |

**Plain actions:** `setCredentials`, `setAccessToken`, `setUserProfile`, `clearAuth`, `setLoading`.
**Async actions (thunks):**
- `checkAuth`: call `/auth/refresh` to restore a session.
- `fetchUserProfile`: call `/user/profile` and store it in `profile`.
- `logoutUser`: call `/auth/logout`, then `clearAuth`.

### 10.3 The HTTP client

[Frontend/src/api/axios.js](Frontend/src/api/axios.js) creates `api` with `baseURL: "http://localhost:3200/api"` and `withCredentials: true` (send cookies). It has two interceptors (see [9.4](#94-automatic-token-refresh-when-the-access-token-expires)). Every component that talks to the backend imports this `api`.

### 10.4 Pages and components

| File | What it shows | Data it uses |
|---|---|---|
| [pages/login.jsx](Frontend/src/pages/login.jsx) | Username/email + password form | `POST /auth/login`, then Redux `setCredentials` |
| [pages/signup.jsx](Frontend/src/pages/signup.jsx) | Registration form with a live password strength meter | `POST /auth/register` |
| [pages/homepage.jsx](Frontend/src/pages/homepage.jsx) | Navbar, welcome banner with solved count, filters, problem table, pagination, settings modal. Has 3 tabs: Problems, Contest ("coming soon"), Chat Room (placeholder) | `GET /problems`, `GET /problems/solved`, `fetchUserProfile` |
| [components/Navbar.jsx](Frontend/src/components/Navbar.jsx) | Logo, tab buttons, avatar menu (name, email, solved breakdown, Settings, Sign out) | Redux `user` + `profile`; dispatches `logoutUser` |
| [components/ProblemFilters.jsx](Frontend/src/components/ProblemFilters.jsx) | Search box, difficulty and status dropdowns | Props only (controlled by Homepage) |
| [components/ProblemTable.jsx](Frontend/src/components/ProblemTable.jsx) | Table rows: ✓ status, `#. Title`, colored difficulty, up to 3 tags; skeleton rows while loading | Props only |
| [components/Pagination.jsx](Frontend/src/components/Pagination.jsx) | "Showing 1 to 10 of 20", Prev, numbered pages, Next | Props only |
| [components/SettingsModal.jsx](Frontend/src/components/SettingsModal.jsx) | Read-only account info popup | Props only |
| [components/CodeHubLogo.jsx](Frontend/src/components/CodeHubLogo.jsx) | Logo; clicking it goes to `/` | none |
| [pages/problem.jsx](Frontend/src/pages/problem.jsx) | The problem page: resizable panels with description/submissions on the left, editor on the top right, console on the bottom right. Owns all state (problem, language, code, run/submit result) | `GET /problems/:id`, `GET /problems/solved`, `POST /execution/run`, `POST /execution/submit`, `GET /execution/result/:id` |
| [components/problem/*](Frontend/src/components/problem/) | Header, description, submissions list, editor panel, console panel | Props from the problem page (SubmissionsList fetches `GET /problems/:id/submissions` itself) |

**Pattern used:** *container + presentational components*. `Homepage` owns all the state (search text, filters, current page, problems) and passes data + callback functions down as **props**; the smaller components just display what they receive and call the callbacks.

---

## 11. Frontend flows

### 11.1 First visit, not logged in

1. App mounts → `checkAuth` → `/auth/refresh` fails (no cookie) → `isAuthenticated=false`, `isLoading=false`.
2. Route `/` sees not authenticated → `<Navigate to="/login">`.

### 11.2 Signing up then logging in

1. `/signup` → fill form → `POST /auth/register` → redirect to `/login` with `state.registered = true` → green banner.
2. Log in → `setCredentials` → `isAuthenticated=true` → `navigate("/")`.

### 11.3 Home page lifecycle

1. Homepage mounts. Effect #1: fetch solved IDs + `fetchUserProfile()`. Navbar's effect also requests the profile if it isn't loaded yet.
2. Effect #2 (runs when `currentPage`, `selectedDifficulty` or `searchQuery` change): wait 0 ms (or 300 ms while typing a search), then `GET /problems?...`. While loading, the table shows skeleton rows.
3. Changing search or difficulty resets to page 1.
4. `filteredProblems` (a `useMemo`) applies the solved/unsolved filter to the current page.
5. Clicking a problem title opens `/problems/<problemID>` (for example `/problems/1`).

### 11.4 The problem page

1. **Opening it:** clicking "Two Sum" goes to `/problems/1`. React Router loads `pages/problem.jsx` **lazily** (its code is downloaded only now), and `@monaco-editor/react` fetches the Monaco editor from a CDN.
2. **Loading data:** the page calls `GET /problems/1` (statement, examples, starter code; never hidden tests or solutions) and `GET /problems/solved` (to show "✓ Solved") in parallel. A missing problem shows "This problem doesn't exist."
3. **Choosing the starting code:**
   - Language = your last used language (saved in `localStorage` as `codehub:language`), else the problem's main starter language (C++ for the seeded problems).
   - Code = your saved draft for this problem + language (`codehub:code:<problemDbId>:<language>`), else the problem's starter code, else a generic stdin/stdout template from `constants/languages.js`.
   - Every keystroke saves the draft, so reloading the page or switching languages never loses code. **Reset** restores the starter code.
4. **Run** (button or Ctrl/⌘ + '):
   - `POST /execution/run` → runs only the visible examples (max 3 runs per minute).
   - The **Test Result** tab shows Accepted / Wrong Answer / Runtime Error / Compilation Error, "x / y passed", and one tab per case (green/red dot) with Input, Output, Expected and Stderr.
5. **Submit** (button or Ctrl/⌘ + Enter):
   - `POST /execution/submit` → returns a `submissionId` immediately (the job is queued, see [9.9](#99-submit-code-the-real-judge-via-a-queue)).
   - The page shows "Judging your submission…" and polls `GET /execution/result/:submissionId` every second until the verdict is no longer `Pending` (it gives up after ~45 s and asks you to check the Submissions tab).
   - It shows the verdict, "x / y test cases passed", and Runtime/Memory if Accepted. On Accepted it shows "✓ Solved" and refreshes the profile counts.
   - The Submissions list is refreshed after every submit.
6. **Submissions tab:** lists your past submissions for this problem (newest first). Click one to see its code and error output; **Load into editor** puts that code back in the editor.
7. **Layout:** the dividers between panels can be dragged (react-resizable-panels). Monaco's `automaticLayout` option makes it resize with them.
8. **Leaving mid-submit:** polling stops (an `unmountedRef` flag), and the submission still finishes in the background.

### 11.5 Signing out

Navbar → `logoutUser` → backend logout → `clearAuth` → `navigate("/login")`.

---

## 12. Helper scripts

These are run manually with Node from the `backend/` folder. They connect to the same database as the server using `.env`.

| Script | What it does | Run with |
|---|---|---|
| `src/utils/seedProblems.js` | Inserts or updates 20 classic problems (Two Sum … Median of Two Sorted Arrays), each with 2 visible + 3 hidden test cases and Python starter/reference code. Sets `problemCreator` to the first admin (or the first user) | `node src/utils/seedProblems.js` |
| `src/utils/updateCppStarterCode.js` | Makes C++ the main starter code and keeps the Python one in `starterCodes[]` | `node src/utils/updateCppStarterCode.js` |
| `src/utils/updateCppReferenceSolution.js` | Makes C++ the main reference solution and keeps Python in `referenceSolutions[]` | `node src/utils/updateCppReferenceSolution.js` |
| `test-demo.js` | Builds its own copy of the app on port 3599, creates a temporary admin + user, creates a problem, runs and submits solutions, prints results, then deletes everything it created | `node test-demo.js` |

Run order for a fresh database: create a user → make it admin in MongoDB → `seedProblems.js` → `updateCppStarterCode.js` → `updateCppReferenceSolution.js`.

---

## 13. How to run the project

**Prerequisites:** Node.js 20+ and internet access (MongoDB Atlas, Redis Cloud and Judge0 are all remote).

```bash
# 1. Backend
cd backend
npm install
# make sure backend/.env has: PORT=3200, DB_URI, JWT_KEY, REFRESH_KEY, REDIS_KEY, REDIS_HOST, REDIS_PORT
# (see backend/.env.example). The Redis database must use the "noeviction" eviction policy.
# optional for real emails: EMAIL_USER, EMAIL_PASS, EMAIL_SERVICE, EMAIL_FROM
npm run dev            # → "Connected to both database and redis" / "Submission worker started" / "Server is running on port 3200"

# 2. Frontend (in a second terminal)
cd Frontend
npm install
npm run dev            # → open http://localhost:5173
```

The frontend expects the backend at `http://localhost:3200` and the backend only accepts browser requests from `http://localhost:5173`. If you change either port, update `Frontend/src/api/axios.js`, `Frontend/src/store/slices/authSlice.js` and the `cors` origin in `backend/src/index.js`.

---

## 14. Glossary

| Term | Meaning |
|---|---|
| **API** | The set of URLs the backend offers for the frontend to call |
| **Endpoint / Route** | One URL + HTTP method, e.g. `POST /api/auth/login` |
| **HTTP methods** | `GET` read, `POST` create/action, `PUT`/`PATCH` update, `DELETE` remove |
| **Status codes** | `200` OK, `201` Created, `400` bad input, `401` not logged in, `403` not allowed, `404` not found, `409` conflict, `429` too many requests, `500` server error |
| **Middleware** | A function that runs before the final handler and can stop the request or add data to it |
| **Controller** | Turns an HTTP request into a service call and the result into an HTTP response |
| **Service** | Holds the business rules; doesn't know about HTTP |
| **Model / Schema** | The description of what a stored document looks like |
| **ObjectId / `_id`** | MongoDB's automatic 24-character unique ID for each document |
| **JWT** | JSON Web Token: a signed string containing data like your user ID; the server can check it wasn't tampered with |
| **Access token** | Short-lived JWT sent with each request to prove who you are |
| **Refresh token** | Long-lived JWT used only to get new access tokens |
| **HttpOnly cookie** | A cookie that JavaScript in the page can't read; only the browser sends it |
| **Token rotation** | Replacing the refresh token every time it's used, so old ones stop working |
| **Blacklist** | A list of tokens that are refused even though they haven't expired |
| **bcrypt / hashing** | One-way scrambling of a password; you can check a guess against it but can't reverse it |
| **Salt rounds** | How much work bcrypt does; higher is slower and harder to crack |
| **OTP** | One-Time Password, here a 6-digit email code |
| **Rate limiting** | Capping how many requests someone can make in a time window |
| **Redis** | An in-memory database that is very fast and supports automatic expiry |
| **Aggregation / `$facet`** | MongoDB's way to compute statistics; `$facet` runs several calculations in one pass |
| **`populate`** | Mongoose feature that replaces an ID with the actual referenced document |
| **`$addToSet`** | MongoDB update that adds a value to an array only if it isn't already there |
| **Judge0** | A service that runs untrusted code in an isolated sandbox and reports output, time and memory |
| **stdin / stdout** | Standard input/output: where a program reads input from and prints results to |
| **Verdict** | The final judgement on a submission: Accepted, Wrong Answer, etc. |
| **Batch submission** | Sending all test cases to Judge0 in a single request instead of one by one |
| **Polling** | Asking repeatedly "is it done yet?" every second |
| **CORS** | Browser security rule; the server must explicitly allow other origins (like port 5173) to call it |
| **Redux store / slice / thunk** | Store: the global state object. Slice: one section of it with its update functions. Thunk: an async function that can call the API and then update the store |
| **Interceptor** | An axios hook that runs on every request or response |
| **Debounce** | Waiting until the user stops typing before acting |
| **Props** | Data passed from a parent React component to a child |
| **`useEffect`** | React hook to run code after render (e.g. fetching data) |
| **`useMemo`** | React hook to cache a computed value until its inputs change |
| **StrictMode** | React development mode that intentionally runs effects twice to expose bugs |
