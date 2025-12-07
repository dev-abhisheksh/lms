import { Course } from "../models/course.model.js";
import { CourseEnrollment } from "../models/courseEnrollment.model.js";
import { Module } from "../models/module.model.js";


const createModule = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description } = req.body;
        if (!courseId || !title) return res.status(400).json({ message: "CourseID & title are required" })

        const course = await Course.findById(courseId)
            .populate("department", "name code isActive")
        if (!course) return res.status(404).json({ message: "Course not found" })

        const department = course?.department;
        if (!["admin", "teacher"].includes(req.user.role)) {
            return res.status(403).json({ message: "Only Admins & Assigned teachers are permitted" })
        }

        if (req.user.role !== "admin") {
            if (!department.isActive) return res.status(403).json({ message: "Department is not active" })

            const teacherEnrollment = await CourseEnrollment.findOne({
                user: req.user._id,
                course: courseId,
                role: "teacher"
            })

            if (!teacherEnrollment) return res.status(403).json({ message: "You're not assigned to teach this course" })
        }

        const module = await Module.create({
            title: title.trim(),
            description: description.trim() || "",
            course: courseId,
        })

        return res.status(201).json({
            message: "Module created successfully",
            module
        })

    } catch (error) {
        console.error("Failed to create module", error)
        return res.status(500).json({ message: "Failed to create module" })
    }
}

const getAllModules = async (req, res) => {
    try {
        const { courseId } = req.params;
        if (!courseId) return res.status(400).json({ message: "CourseID is required" })

        const course = await Course.findById(courseId)
            .populate("department", "name code isActive")
        if (!course) return res.status(404).json({ message: "Course not found" })

        const department = course?.department;
        const modules = await Module.find({ course: courseId })

        if (req.user.role === "admin") {
            return res.status(200).json({
                message: `Fetched all modules for course: ${course?.title}`,
                count: modules.length,
                modules
            })
        }


        if (!department?.isActive) return res.status(403).json({ message: "Department is not active" })
        modules = modules.filter(m => m.isActive)
        //manager validations
        if (req.user.role === "manager") {
            return res.status(200).json({
                message: `Fetched all modules for course: ${course?.title}`,
                count: modules.length,
                modules
            })
        }

        //teacher validations
        if (req.user.role === "teacher") {
            const enrolledTeacher = await CourseEnrollment.findOne({
                user: req.user._id,
                course: courseId,
                role: "teacher"
            })
            if (!enrolledTeacher) return res.status(403).json({ message: "You're not assigned to tech this course" })

            return res.status(200).json({
                message: `Fetched all modules for course: ${course?.title}`,
                count: modules.length,
                modules
            })
        }

        //student validations
        if (!course.isPublished) return res.status(403).json({ message: "Course is not Published" })

        const enrolledStudent = await CourseEnrollment.findOne({
            user: req.user._id,
            course: courseId,
            role: "student"
        })

        if (!enrolledStudent) return res.status(403).json({ message: "You're not enrolled in this course" })

        return res.status(200).json({
            message: `Fetched all modules for course: ${course?.title}`,
            count: modules.length,
            modules
        })

    } catch (error) {
        console.error("Failed to fetch Modules", error)
        return res.status(500).json({ message: "Failed to fetch Modules" })
    }
}

export {
    createModule,
    getAllModules
}