import express from "express"

import { authMiddleware, requireRole } from "../../auth/middlewares/auth.middleware.js"
import { deleteLesson, updateLessonDetails } from "../controllers/lesson.controller.js"
import { confirmUpload, requestUploadUrl } from "../controllers/lesson-upload.controller.js"

const lessonRouter = express.Router()

lessonRouter.use(authMiddleware)
lessonRouter.use(requireRole("ADMIN"))

lessonRouter.patch('/:id', updateLessonDetails)
lessonRouter.delete('/:id', deleteLesson)

lessonRouter.post('/:id/video/upload-url', requestUploadUrl)
lessonRouter.post('/:id/video/confirm', confirmUpload)

export default lessonRouter