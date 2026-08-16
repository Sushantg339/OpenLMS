import envConfig from "./env.config.js"

const allowedOrigins = [
    envConfig.FRONTEND_URL,
    "http://localhost:5000",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5000",
].filter(Boolean)

const isLocalhost = (origin: string) => /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)

export const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // allow no-origin requests (curl, server-to-server, mobile apps) and localhost origins
        if (!origin || allowedOrigins.includes(origin) || isLocalhost(origin)) {
            return callback(null, true)
        }
        return callback(new Error("Not allowed by CORS"))
    },
    credentials: true,   // required — without this, the browser won't send/accept your auth cookies cross-origin
}