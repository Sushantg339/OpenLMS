import express from "express"

import { authMiddleware, requireRole } from "../../auth/middlewares/auth.middleware.js"
import { deleteSection, updateSectionDetails } from "../controllers/section.controller.js"
import { createLesson, reorderLessons } from "../controllers/lesson.controller.js"

const sectionRouter = express.Router()

sectionRouter.use(authMiddleware)
sectionRouter.use(requireRole("ADMIN"))

sectionRouter.patch('/:id', updateSectionDetails)
sectionRouter.delete('/:id', deleteSection)
sectionRouter.post('/:sectionId/lessons', createLesson)
sectionRouter.patch('/:sectionId/lessons/reorder', reorderLessons)

export default sectionRouter