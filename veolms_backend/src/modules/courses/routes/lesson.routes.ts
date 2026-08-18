import express from "express"

import { authMiddleware, requireRole } from "../../auth/middlewares/auth.middleware.js"
import { deleteLesson, getLessonProgress, updateLessonDetails } from "../controllers/lesson.controller.js"
import { confirmUpload, requestUploadUrl } from "../controllers/lesson-upload.controller.js"
import { getLessonVideo, getVideoPlaybackToken } from "../controllers/lesson-playback.controller.js"
import { streamHlsFile } from "../controllers/hls.controller.js"

const lessonRouter = express.Router()

lessonRouter.use(authMiddleware)

lessonRouter.get('/:id/video', getLessonVideo)
lessonRouter.patch('/:id', requireRole("ADMIN"),updateLessonDetails)
lessonRouter.delete('/:id', requireRole("ADMIN"), deleteLesson)
lessonRouter.get('/:id/progress', getLessonProgress);

lessonRouter.post('/:id/video/upload-url', requireRole("ADMIN"), requestUploadUrl)
lessonRouter.post('/:id/video/confirm', requireRole("ADMIN"), confirmUpload)
lessonRouter.get("/:id/playback-token", authMiddleware, getVideoPlaybackToken)
lessonRouter.get("/:id/hls/*file", streamHlsFile)

export default lessonRouter