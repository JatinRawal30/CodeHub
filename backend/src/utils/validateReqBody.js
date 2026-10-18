const { z } = require("zod");

// -------------------------------------------------------------
// USER VALIDATION
// -------------------------------------------------------------
const userValidation = z.object({
    firstName: z.string().min(3, "First name must be at least 3 characters").max(20, "First name cannot exceed 20 characters"),
    lastName: z.string().min(3, "Last name must be at least 3 characters").max(20, "Last name cannot exceed 20 characters").optional(),
    age: z.number().min(6, "Age must be at least 6").max(100).optional(),
    username: z.string().min(3, "Username must be at least 3 characters").max(20),
    email: z.string().email("Invalid email format"),
    password: z.string()
        .min(8, { message: 'Password must be at least 8 characters long' })
        .max(32, { message: 'Password cannot exceed 32 characters' })
        .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
        .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number' })
        .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' }),
    confirmPassword: z.string(),
    role: z.enum(['user', 'admin']).default('user'),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
);

// Login accepts a plain string identifier (email or username) only, so
// objects like {"$regex": "..."} can never reach a MongoDB query.
const loginValidation = z.object({
    identifier: z.string().trim().min(1, "Identifier is required").max(100),
    password: z.string().min(1, "Password is required").max(128),
});

// -------------------------------------------------------------
// PROBLEM VALIDATION
// -------------------------------------------------------------
const TAG_ENUM = [
    'arrays', 'strings', 'dynamic programming', 'trees', 'graphs',
    'linked list', 'hash table', 'sorting', 'searching', 'recursion',
    'backtracking', 'heaps', 'tries', 'geometry', 'math',
    'two pointers', 'sliding window', 'stack', 'queue', 'special'
];

const LANGUAGE_ENUM = ['javascript', 'python', 'java', 'cpp', 'c'];

const visibleTestCaseSchema = z.object({
    input: z.string({ required_error: "Test case input is required" }),
    output: z.string({ required_error: "Test case output is required" }),
    explanation: z.string().default(""),
});

const hiddenTestCaseSchema = z.object({
    input: z.string({ required_error: "Hidden test case input is required" }),
    output: z.string({ required_error: "Hidden test case output is required" }),
});

const createProblemValidation = z.object({
    problemID: z.number({ required_error: "problemID is required" }).int().positive(),
    title: z.string({ required_error: "title is required" }).min(3).max(200),
    description: z.string({ required_error: "description is required" }).min(10),
    difficulty: z.enum(['easy', 'medium', 'hard'], { required_error: "difficulty must be easy, medium, or hard" }),
    tags: z.array(z.enum(TAG_ENUM)).default([]),
    visibleTestCases: z.array(visibleTestCaseSchema).min(1, "At least one visible test case is required"),
    hiddenTestCases: z.array(hiddenTestCaseSchema).min(1, "At least one hidden test case is required"),
    constraints: z.array(z.string()).default([]),
    timeLimit: z.number().min(0.1).max(10).default(1.0),
    memoryLimit: z.number().int().min(16).max(1024).default(256),
    referenceSolution: z.object({
        language: z.enum(LANGUAGE_ENUM, { required_error: "Reference solution language is required" }),
        completeCode: z.string().min(1, "Reference solution completeCode cannot be empty"),
    }),
    referenceSolutions: z.array(z.object({
        language: z.enum(LANGUAGE_ENUM),
        completeCode: z.string().min(1),
    })).optional(),
    starterCode: z.object({
        language: z.enum(LANGUAGE_ENUM, { required_error: "Starter code language is required" }),
        code: z.string().min(1, "Starter code cannot be empty"),
    }),
    starterCodes: z.array(z.object({
        language: z.enum(LANGUAGE_ENUM),
        code: z.string().min(1),
    })).optional(),
});

const updateProblemValidation = createProblemValidation.omit({ problemID: true }).partial();

// -------------------------------------------------------------
// CODE EXECUTION & SUBMISSION VALIDATION
// -------------------------------------------------------------
const executionValidation = z.object({
    problemId: z.union([
        z.number().int().positive(),
        z.string().min(1, { message: "problemId cannot be empty" })
    ], {
        required_error: "problemId is required",
        invalid_type_error: "problemId must be a number or string identifier",
    }),
    language: z.enum(LANGUAGE_ENUM, {
        required_error: "language is required",
        invalid_type_error: `Supported languages: ${LANGUAGE_ENUM.join(", ")}`,
    }),
    code: z.string().min(1, { message: "Code cannot be empty" }),
});


// -------------------------------------------------------------
// PROFILE UPDATE VALIDATION
// -------------------------------------------------------------
// Every field is optional; an empty lastName or avatar means "remove it".
const updateProfileValidation = z.object({
    firstName: z.string().trim()
        .min(3, "First name must be at least 3 characters")
        .max(20, "First name cannot exceed 20 characters")
        .optional(),
    lastName: z.string().trim()
        .max(20, "Last name cannot exceed 20 characters")
        .refine((v) => v === "" || v.length >= 3, "Last name must be at least 3 characters")
        .optional(),
    bio: z.string().trim().max(200, "Bio cannot exceed 200 characters").optional(),
    avatar: z.string().trim().max(500, "Avatar URL is too long")
        .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Avatar must be an http(s) image URL")
        .optional(),
    languagePreferences: z.array(z.enum(LANGUAGE_ENUM)).max(LANGUAGE_ENUM.length).optional(),
});

// change Password req body validation.

const changePasswordValidation = z.object({
    oldPassword: z.string().min(8, "Password must be at least 8 characters long").max(32, "Password cannot exceed 32 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number").regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    newPassword: z.string()
        .min(8, { message: 'Password must be at least 8 characters long' })
        .max(32, { message: 'Password cannot exceed 32 characters' })
        .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
        .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number' })
        .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' }),
    confirmPassword: z.string(),
}).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
);

module.exports = {
    userValidation,
    loginValidation,
    createProblemValidation,
    updateProblemValidation,
    executionValidation,
    changePasswordValidation,
    updateProfileValidation,
};