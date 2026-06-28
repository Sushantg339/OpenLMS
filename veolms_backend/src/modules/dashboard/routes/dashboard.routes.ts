import express from "express"
import { authMiddleware } from "../../auth/middlewares/auth.middleware.js"
import { getContinueLearning, getMyCourses, updateLessonProgress } from "../controller/dashboard.controller.js"

const dashboardRouter = express.Router()

dashboardRouter.use(authMiddleware)

dashboardRouter.patch('/lesson/:id/progress', updateLessonProgress)
dashboardRouter.get('/continue-learning', getContinueLearning)
dashboardRouter.get('/my-courses', getMyCourses)

export default dashboardRouter