import express from "express"
import verifyJWT from "../middlewares/auth.midleware.js";
import { loginUser, registerUser } from "../controllers/auth.controller.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();


router.post("/register", registerUser)
router.post("/login", loginUser)


export default router;