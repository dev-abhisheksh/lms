import express from "express"
import verifyJWT from "../middlewares/auth.midleware.js";
import { loginUser, registerUser } from "../controllers/auth.controller.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import rateLimiter from "../middlewares/rateLimiter.js";

const router = express.Router();


router.post("/register", rateLimiter({ keyPrefix: "register", limit: 3, windowSec: 60 }), registerUser)
router.post("/login", rateLimiter({ keyPrefix: "login", limit: 5, windowSec: 60 }), loginUser)


export default router;