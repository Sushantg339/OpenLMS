import { Worker } from "bullmq"
import fs from "node:fs/promises"
import path from "node:path"

import { queueConnection } from "../lib/queue.js"
import { downloadFromR2 } from "../services/r2-download.service.js"
import { transcodeToHls } from "../services/video-transcoder.service.js"
import { uploadHlsDirectory } from "../services/r2-upload.service.js"
import { prisma } from "../lib/prisma.js"


export const videoProcessingWorker = new Worker(
    "video-processing",

    async (job) => {

        const { lessonId, rawUploadKey } = job.data

        const workDir = path.join(
            "/tmp",
            "video-processing",
            lessonId
        )

        const inputPath = path.join(
            workDir,
            "input"
        )

        const outputDir = path.join(
            workDir,
            "hls"
        )

        try {

            await fs.mkdir(
                workDir,
                { recursive: true }
            )

            console.log(
                `Downloading ${rawUploadKey}...`
            )

            await downloadFromR2(
                rawUploadKey,
                inputPath
            )

            console.log(
                "Download completed"
            )

            console.log(
                "Starting HLS transcoding..."
            )

            const playlistPath =
                await transcodeToHls(
                    inputPath,
                    outputDir
                )

            console.log(
                `HLS generated: ${playlistPath}`
            )

            
            const hlsPrefix = `hls/${lessonId}`
            console.log(`HLS uploading to R2 : ${hlsPrefix}`)

            await uploadHlsDirectory(
                outputDir,
                hlsPrefix
            )

            console.log(
                `HLS uploaded to R2: ${hlsPrefix}`
            )

            const hlsKey = `hls/${lessonId}/playlist.m3u8`

            await prisma.lesson.update({
                where: {
                    id: lessonId,
                },
                data: {
                    hlsKey,
                    status: "READY",
                },
            })

            console.log(`hlsKey added to db : ${hlsKey}`)

            console.log(
                `Cleaning up temporary files for lesson ${lessonId}`
            )

            await fs.rm(workDir, {
                recursive: true,
                force: true,
            })

            console.log(
                `Cleaned up temporary files for lesson ${lessonId}`
            )

        } finally {

            // Keep files for now so we can inspect them.

        }
    },

    {
        connection: queueConnection,
        concurrency: 1,
    }
)


videoProcessingWorker.on(
    "completed",
    (job) => {
        console.log(
            `Job ${job.id} completed`
        )
    }
)


videoProcessingWorker.on(
    "failed",
    async (job, error) => {

        console.error(
            `Job ${job?.id} failed:`,
            error
        )

        if (!job) {
            return
        }

        const { lessonId } = job.data

        if (job.attemptsMade >= 3) {

            await prisma.lesson.update({
                where: {
                    id: lessonId,
                },
                data: {
                    status: "FAILED",
                },
            })

            console.error(
                `Video processing permanently failed for lesson ${lessonId}`
            )

            const workDir = path.join(
                "temp",
                "video-processing",
                lessonId
            )

            await fs.rm(workDir, {
                recursive: true,
                force: true,
            })

            console.log(
                `Cleaned up failed job files for lesson ${lessonId}`
            )
        }
    }
)