import { createClient } from "redis";
import envConfig from "./env.config.js"
import ApiError from "../utils/ApiError.js";

const REDIS_URL = envConfig.REDIS_URL

if(!REDIS_URL){
    throw new ApiError(500,"Cache DB Url missing")
}

const client = createClient({
    url : REDIS_URL
})

client.on('error', err => console.log('Redis Client Error', err));
client.on('connect', ()=>console.log('redis connected'))

export default client