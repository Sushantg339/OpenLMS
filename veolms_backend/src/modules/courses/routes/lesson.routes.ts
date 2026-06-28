import express from "express"

import { authMiddleware, requireRole } from "../../auth/middlewares/auth.middleware.js"
import { deleteLesson, updateLessonDetails } from "../controllers/lesson.controller.js"
import { confirmUpload, requestUploadUrl } from "../controllers/lesson-upload.controller.js"
import { getLessonVideo } from "../controllers/lesson-playback.controller.js"

const lessonRouter = express.Router()

lessonRouter.use(authMiddleware)

lessonRouter.get('/:id/video', getLessonVideo)
lessonRouter.patch('/:id', requireRole("ADMIN"),updateLessonDetails)
lessonRouter.delete('/:id', requireRole("ADMIN"), deleteLesson)

lessonRouter.post('/:id/video/upload-url', requireRole("ADMIN"), requestUploadUrl)
lessonRouter.post('/:id/video/confirm', requireRole("ADMIN"), confirmUpload)

export default lessonRouter