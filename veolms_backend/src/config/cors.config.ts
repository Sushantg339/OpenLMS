import envConfig from "./env.config.js"

const allowedOrigins = [
    envConfig.FRONTEND_URL,
    "http://localhost:3000",
].filter(Boolean)

export const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // allow no-origin requests (curl, server-to-server, mobile apps) but not browsers from unknown origins
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        return callback(new Error("Not allowed by CORS"))
    },
    credentials: true,   // required — without this, the browser won't send/accept your auth cookies cross-origin
}