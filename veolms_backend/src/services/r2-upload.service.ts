import { PutObjectCommand } from "@aws-sdk/client-s3"
import fs from "node:fs/promises"
import fss from "node:fs"
import path from "node:path"


import { r2Client, R2_BUCKET } from "../lib/r2.js"

export const uploadFileToR2 = async (
    filePath: string,
    key: string,
    contentType: string
): Promise<void> => {

    const fileStream = fss.createReadStream(filePath)

    await r2Client.send(
        new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: fileStream,
            ContentType: contentType,
        })
    )
}



const getContentType = (fileName: string): string => {
    if (fileName.endsWith(".m3u8")) {
        return "application/vnd.apple.mpegurl"
    }

    if (fileName.endsWith(".ts")) {
        return "video/mp2t"
    }

    return "application/octet-stream"
}


export const uploadHlsDirectory = async (
    directory: string,
    r2Prefix: string
): Promise<void> => {

    const files = await fs.readdir(directory)

    for (const fileName of files) {

        const filePath = path.join(
            directory,
            fileName
        )

        const stat = await fs.stat(filePath)

        if (!stat.isFile()) {
            continue
        }

        const key = `${r2Prefix}/${fileName}`

        console.log(`Uploading ${key}...`)

        await uploadFileToR2(
            filePath,
            key,
            getContentType(fileName)
        )
    }
}