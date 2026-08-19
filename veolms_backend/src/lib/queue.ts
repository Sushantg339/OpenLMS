import {Redis} from "ioredis"

export const queueConnection = new Redis(
    process.env.REDIS_URL!,
    {
        maxRetriesPerRequest: null,
    }
)