import express from "express"

import { createCourse, deleteCourse, fetchAllCourses, fetchCourseDetails, fetchCourses, updateCourseDetails } from "../controllers/course.controller.js"
import { authMiddleware, requireRole } from "../../auth/middlewares/auth.middleware.js"
import { createSection, reorderSections } from "../controllers/section.controller.js"

const courseRouter = express.Router()

courseRouter.post('/', authMiddleware, requireRole("ADMIN"), createCourse)
courseRouter.get('/admin', authMiddleware, requireRole("ADMIN"), fetchAllCourses)
courseRouter.get('/', fetchCourses)
courseRouter.get('/:slug', fetchCourseDetails)
courseRouter.patch('/:id', authMiddleware, requireRole("ADMIN"), updateCourseDetails)
courseRouter.delete('/:id', authMiddleware, requireRole("ADMIN"), deleteCourse)

courseRouter.post('/:courseId/sections', authMiddleware, requireRole("ADMIN"), createSection)
courseRouter.patch('/:courseId/sections/reorder', authMiddleware, requireRole("ADMIN"), reorderSections)

export default courseRouter