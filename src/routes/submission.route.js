import express from "express"
import verifyJWT from "../middlewares/auth.midleware.js"
import authorizeRoles from "../middlewares/role.middleware.js";
import { createSubmission, getAllSubmissions } from "../controllers/submission.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/create/:assignmentId", verifyJWT, authorizeRoles("student"), upload.array("files", 5), createSubmission)
router.get("/submissions/:assignmentId", verifyJWT, authorizeRoles("admin", "teacher"), getAllSubmissions)

export default router;