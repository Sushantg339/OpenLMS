import express from "express"

import { createCourse, deleteCourse, fetchAllCourses, fetchCourseById, fetchCourseDetails, fetchCourses, updateCourseDetails } from "../controllers/course.controller.js"
import { authMiddleware, requireRole } from "../../auth/middlewares/auth.middleware.js"
import { createSection, reorderSections } from "../controllers/section.controller.js"
import { optionalAuthMiddleware } from "../../auth/middlewares/optional-auth.middleware.js"
import { imageUpload, videoUpload } from "../../../middlewares/upload.middleware.js"
import { uploadCourseThumbnail, uploadCourseTrailer } from "../controllers/course-media.controller.js"

const courseRouter = express.Router()

courseRouter.post('/', authMiddleware, requireRole("ADMIN"), createCourse)
courseRouter.get('/admin', authMiddleware, requireRole("ADMIN"), fetchAllCourses)
courseRouter.get('/admin/:id', authMiddleware, requireRole("ADMIN"), fetchCourseById)
courseRouter.get('/', fetchCourses)
courseRouter.get('/:slug', optionalAuthMiddleware, fetchCourseDetails)
courseRouter.patch('/:id', authMiddleware, requireRole("ADMIN"), updateCourseDetails)
courseRouter.delete('/:id', authMiddleware, requireRole("ADMIN"), deleteCourse)
courseRouter.post('/:id/thumbnail', authMiddleware, requireRole("ADMIN"), imageUpload.single("thumbnail"), uploadCourseThumbnail)
courseRouter.post('/:id/trailer', authMiddleware, requireRole("ADMIN"), videoUpload.single("trailer"), uploadCourseTrailer)

courseRouter.post('/:courseId/sections', authMiddleware, requireRole("ADMIN"), createSection)
courseRouter.patch('/:courseId/sections/reorder', authMiddleware, requireRole("ADMIN"), reorderSections)

export default courseRouter