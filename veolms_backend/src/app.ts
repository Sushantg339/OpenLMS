import express from "express"
import cookieParser from "cookie-parser"

import authRouter from "./modules/auth/routes/auth.routes.js"
import errorHandler from "./middlewares/error.middleware.js"
import courseRouter from "./modules/courses/routes/course.routes.js"
import sectionRouter from "./modules/courses/routes/section.router.js"
import lessonRouter from "./modules/courses/routes/lesson.routes.js"

const app = express()

// global middlewares
app.use(express.json())
app.use(cookieParser())

// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/courses', courseRouter)
app.use('/api/v1/sections', sectionRouter)
app.use('/api/v1/lessons', lessonRouter)


// error handling middleware
app.use(errorHandler)

// heath check route
app.get('/health', (req , res)=>{
    res.send("Health check running...")
})

export default app