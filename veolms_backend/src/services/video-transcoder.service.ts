import { spawn } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"

export const transcodeToHls = async (
    inputPath: string,
    outputDir: string
): Promise<string> => {

    await fs.mkdir(outputDir, { recursive: true })

    const playlistPath = path.join(outputDir, "playlist.m3u8")

    return new Promise((resolve, reject) => {

        const ffmpeg = spawn("ffmpeg", [
            "-i", inputPath,

            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "23",
            "-vf", "scale=-2:720",

            "-c:a", "aac",
            "-b:a", "128k",

            "-hls_time", "6",
            "-hls_playlist_type", "vod",

            "-hls_segment_filename",
            path.join(outputDir, "segment_%03d.ts"),

            playlistPath,
        ])

        ffmpeg.stderr.on("data", (data) => {
            console.log(`[FFmpeg] ${data}`)
        })

        ffmpeg.on("error", (error) => {
            reject(error)
        })

        ffmpeg.on("close", (code) => {

            if (code === 0) {
                resolve(playlistPath)
            } else {
                reject(
                    new Error(`FFmpeg exited with code ${code}`)
                )
            }

        })
    })
}