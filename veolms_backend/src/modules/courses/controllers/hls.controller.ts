import { GetObjectCommand } from "@aws-sdk/client-s3"
import { type Request, type Response } from "express"

import { r2Client, R2_BUCKET } from "../../../lib/r2.js"
import { prisma } from "../../../lib/prisma.js"
import { verifyVideoPlaybackToken } from "../../../utils/videoPlaybackToken.js"
import asyncHandler from "../../../utils/asyncHandler.js"

export const streamHlsFile = asyncHandler(
    async (req: Request, res: Response) => {

        const { id: lessonId } = req.params
        const { token } = req.query

        if (typeof token !== "string") {
            return res.status(401).json({
                success: false,
                data: null,
                message: "Playback token required",
                error: {
                    message: "A valid playback token is required.",
                },
            })
        }

        const decoded = verifyVideoPlaybackToken(token)

        if (!decoded) {
            return res.status(401).json({
                success: false,
                data: null,
                message: "Invalid playback token",
                error: {
                    message: "The playback token is invalid or expired.",
                },
            })
        }

        if (decoded.lessonId !== lessonId) {
            return res.status(403).json({
                success: false,
                data: null,
                message: "Invalid playback token",
                error: {
                    message: "This token cannot be used for this lesson.",
                },
            })
        }

        const lesson = await prisma.lesson.findUnique({
            where: {
                id: lessonId as string,
            },
            select: {
                id: true,
                hlsKey: true,
                status: true,
            },
        })

        if (!lesson || !lesson.hlsKey) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "HLS video not found",
                error: {
                    message: "This lesson has no HLS video.",
                },
            })
        }

        if (lesson.status !== "READY") {
            return res.status(409).json({
                success: false,
                data: null,
                message: "Video not ready",
                error: {
                    message: "This video is not ready for playback.",
                },
            })
        }

        const fileParam = req.params.file

        const requestedFile = Array.isArray(fileParam)
            ? fileParam.join("/")
            : fileParam

        if (!requestedFile) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "HLS file missing",
                error: {
                    message: "No HLS file was requested.",
                },
            })
        }


        // Prevent path traversal
        if (
            requestedFile.includes("..") ||
            requestedFile.includes("\\")
        ) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "Invalid HLS path",
                error: {
                    message: "Invalid HLS file path.",
                },
            })
        }

        const hlsDirectory = lesson.hlsKey.substring(
            0,
            lesson.hlsKey.lastIndexOf("/")
        )

        const key = `${hlsDirectory}/${requestedFile}`

        const command = new GetObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
        })

        let object

        try {
            object = await r2Client.send(command)
        } catch (error) {

            console.error("HLS object not found:", {
                key,
                error,
            })

            return res.status(404).json({
                success: false,
                data: null,
                message: "HLS file not found",
                error: {
                    message: "The requested HLS file does not exist.",
                },
            })
        }

        if (!object.Body) {
            return res.status(404).end()
        }

        if (requestedFile.endsWith(".m3u8")) {

            const playlist = await object.Body.transformToString()

            res.setHeader(
                "Content-Type",
                "application/vnd.apple.mpegurl"
            )

            res.setHeader(
                "Cache-Control",
                "private, no-store"
            )

            return res.send(playlist)
        }

        if (object.ContentType) {
            res.setHeader(
                "Content-Type",
                object.ContentType
            )
        }

        res.setHeader(
            "Cache-Control",
            "private, max-age=300"
        )

        const body = object.Body as NodeJS.ReadableStream

        body.pipe(res)
    }
)