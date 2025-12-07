import express from "express";
import verifyJWT from "../middlewares/auth.midleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import { createModule, getAllModules } from "../controllers/module.controller.js";


const router = express.Router();

router.post("/create/:courseId", verifyJWT, authorizeRoles("admin", "teacher"), createModule)
router.get("/:courseId", verifyJWT, getAllModules)

export default router;