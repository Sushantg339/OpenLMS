import { S3Client } from "@aws-sdk/client-s3"

import envConfig from "../config/env.config.js"
import ApiError from "../utils/ApiError.js"


const R2_ACCOUNT_ID = envConfig.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = envConfig.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = envConfig.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = envConfig.R2_BUCKET_NAME

if(!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY){
    throw new ApiError(500, "Cloudflare credentials not found")
}

export const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
})

export const R2_BUCKET = R2_BUCKET_NAME;