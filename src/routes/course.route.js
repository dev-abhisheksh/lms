import express from "express"
import verifyJWT from "../middlewares/auth.midleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import { createCourse, getAllCourses, getCourseById, getMyCourse, publishCourse, updateCourse } from "../controllers/course.controller.js";
import rateLimiter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/create/:departmentId", verifyJWT, authorizeRoles("teacher", "admin"), createCourse)
router.get("/courses", verifyJWT, rateLimiter({ keyPrefix: "courses", limit: 5, windowSec: 60 }), getAllCourses);
router.get("/my-courses", verifyJWT, getMyCourse)
router.get("/course/:courseId", verifyJWT, getCourseById)
router.patch("/update/:courseId", verifyJWT, authorizeRoles("admin", "teacher"), updateCourse)
router.patch("/publish/:courseId", verifyJWT, authorizeRoles("admin", "teacher"), publishCourse)

export default router;