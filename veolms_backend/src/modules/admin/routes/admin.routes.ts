import express from "express"
import { authMiddleware, requireRole } from "../../auth/middlewares/auth.middleware.js"
import { listStudents, getStudentById, listEnrollments } from "../controllers/admin.controller.js"

const adminRouter = express.Router()

adminRouter.use(authMiddleware)
adminRouter.use(requireRole("ADMIN"))

adminRouter.get('/students', listStudents)
adminRouter.get('/students/:id', getStudentById)
adminRouter.get('/enrollments', listEnrollments)

export default adminRouter