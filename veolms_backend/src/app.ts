import express from "express"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import cors from "cors"

import authRouter from "./modules/auth/routes/auth.routes.js"
import errorHandler from "./middlewares/error.middleware.js"
import courseRouter from "./modules/courses/routes/course.routes.js"
import sectionRouter from "./modules/courses/routes/section.router.js"
import lessonRouter from "./modules/courses/routes/lesson.routes.js"
import paymentRouter from "./modules/payments/routes/payment.routes.js"
import dashboardRouter from "./modules/dashboard/routes/dashboard.routes.js"
import adminRouter from "./modules/admin/routes/admin.routes.js"
import { corsOptions } from "./config/cors.config.js"
import { generalLimiter } from "./middlewares/rateLimiter.middleware.js"

const app = express()

// proxy for Railway/Render
app.set('trust proxy', 1)

// security 
app.use(helmet())
app.use(cors(corsOptions))


// raw body for webhook signature verification
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }))

// global middlewares
app.use(express.json({limit: '50kb'}))
app.use(cookieParser())

// rateLimiter
app.use(generalLimiter)

// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/courses', courseRouter)
app.use('/api/v1/sections', sectionRouter)
app.use('/api/v1/lessons', lessonRouter)
app.use('/api/v1/payments', paymentRouter)
app.use('/api/v1/dashboard', dashboardRouter)
app.use('/api/v1/admin', adminRouter)


// error handling middleware
app.use(errorHandler)

// heath check route
app.get('/health', (req , res)=>{
    res.send("Health check running...")
})

export default app