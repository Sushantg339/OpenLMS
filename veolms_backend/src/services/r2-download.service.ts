import { GetObjectCommand } from "@aws-sdk/client-s3"
import fs from "node:fs"
import { pipeline } from "node:stream/promises"


import { r2Client, R2_BUCKET } from "../lib/r2.js"

export const downloadFromR2 = async (
    key: string,
    destinationPath: string
): Promise<void> => {

    const response = await r2Client.send(
        new GetObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
        })
    )

    if (!response.Body) {
        throw new Error(`R2 object has no body: ${key}`)
    }

    await pipeline(
        response.Body as NodeJS.ReadableStream,
        fs.createWriteStream(destinationPath)
    )
}