import express from "express"
import verifyJWT from "../middlewares/auth.midleware.js"
import authorizeRoles from "../middlewares/role.middleware.js"
import { generateModuleDescription } from "../controllers/ai.controller.js"

const router = express.Router()

router.post("/module-description", verifyJWT, authorizeRoles("admin", "teacher"), generateModuleDescription)

export default router