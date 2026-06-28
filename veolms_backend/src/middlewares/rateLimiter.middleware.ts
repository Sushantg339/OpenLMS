import rateLimit from "express-rate-limit"

// tight limit on auth endpoints specifically — these are brute-force targets
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 min
    limit: 10,                   // 10 attempts per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many attempts. Please try again later.",
        data: null,
        error: { 
            message: "Rate limit exceeded." 
        }
    }
})

// looser, general-purpose limit for the rest of the API — mainly anti-abuse, not anti-brute-force
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
})