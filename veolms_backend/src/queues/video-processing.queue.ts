import { Queue } from "bullmq"
import { queueConnection } from "../lib/queue.js"

export const videoProcessingQueue = new Queue(
    "video-processing",
    {
        connection: queueConnection,

        defaultJobOptions: {
            attempts: 3,

            backoff: {
                type: "exponential",
                delay: 5000,
            },

            removeOnComplete: 100,
            removeOnFail: 100,
        },
    }
)