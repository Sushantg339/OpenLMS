import multer from "multer"
import ApiError from "../utils/ApiError.js"

const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },   // 10MB cap for thumbnails
    fileFilter: (_req, file, cb) => {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
            return cb(new ApiError(4000, "Only JPEG, PNG, or WebP images are allowed"))
        }
        cb(null, true)
    },
})

const videoUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },   //50MB cap — trailers should be short, not full lectures
    fileFilter: (_req, file, cb) => {
        if (!["video/mp4", "video/webm"].includes(file.mimetype)) {
            return cb(new ApiError(400, "Only MP4 or WebM videos are allowed"))
        }
        cb(null, true)
    },
})

export { imageUpload, videoUpload }