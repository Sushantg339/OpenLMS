import app from "./app.js";
import envConfig from "./config/env.config.js";
import client from "./config/redis.config.js"
import seedDataToDB from "./lib/seed.js";

const PORT = envConfig.PORT

const startServer = async()=>{
    try {
        await client.connect()

        app.listen(PORT, ()=>{
            console.log('server is running on port ' + PORT)
        })

        await seedDataToDB()
    } catch (error) {
        console.log('Internal server error', error)
        process.exit(1)
    }
}

startServer()