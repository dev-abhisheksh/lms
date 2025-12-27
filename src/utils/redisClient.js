import Redis from "ioredis";
import dotenv from "dotenv"

dotenv.config()

const client = new Redis(process.env.REDIS_URL,{
    tls: {}
})
console.log("REDIS_URL =", process.env.REDIS_URL);

export {
    client
}