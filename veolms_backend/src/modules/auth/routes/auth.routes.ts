import express from "express"

import { loginController, logoutController, refreshAccessToken, signupController } from "../controllers/auth.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const authRouter = express.Router()

authRouter.post('/signup', signupController)
authRouter.post('/login', loginController)
authRouter.post('/refresh', refreshAccessToken)
authRouter.post('/logout', authMiddleware, logoutController)

export default authRouter