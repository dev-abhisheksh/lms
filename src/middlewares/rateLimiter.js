import Redis from "ioredis";
import { client } from "../utils/redisClient.js";

const rateLimiter = ({ keyPrefix, limit, windowSec }) => {
    return async (req, res, next) => {
        try {
            const identifier = req.user?._id ? `user:${req.user._id}` : `ip:${req.ip}`

            const rediskey = `rate:${keyPrefix}:${identifier}`
            const currentCount = await client.incr(rediskey)

            if (currentCount === 1) {
                await client.expire(rediskey, windowSec)
            }

            if (currentCount > limit) {
                return res.status(429).json({ message: "Too many requests. Please try again later." })
            }

            next()
        } catch (error) {
            console.error("Rate limiter error", error)
            next()
        }
    }
}

export default rateLimiter