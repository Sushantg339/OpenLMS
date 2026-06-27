import express from "express"
import cookieParser from "cookie-parser"

import authRouter from "./modules/auth/routes/auth.routes.js"
import errorHandler from "./middlewares/error.middleware.js"


const app = express()

// global middlewares
app.use(express.json())
app.use(cookieParser())

// routes
app.use('/api/v1/auth', authRouter)



// error handling middleware
app.use(errorHandler)

// heath check route
app.get('/health', (req , res)=>{
    res.send("Health check running...")
})

export default app