import { Assignment } from "../models/assignment.model.js";
import { Course } from "../models/course.model.js";
import { CourseEnrollment } from "../models/courseEnrollment.model.js";
import { Submission } from "../models/submissions.model.js"
import { uploadToCloudinary } from "../utils/cloudinary.js";

const createAssignment = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, dueDate, description, maxMarks } = req.body;

        if (!courseId || !title || !dueDate || !maxMarks) {
            return res.status(400).json({ message: "Title, dueDate, description, maxMarks & courseId are required" })
        }

        //checking if course exists
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" })

        //auth: admin or assigned teacher
        if (req.user.role !== "admin") {
            if (req.user.role === "teacher") {
                const teacherEnrollment = await CourseEnrollment.findOne({
                    user: req.user._id, course: courseId, role: "teacher"
                })
                if (!teacherEnrollment) return res.status(403).json({ message: "You're not assigned to teach this class" })
            } else {
                return res.status(403).json({ message: "Not authorized" })
            }
        }

        //validating business rules
        const now = new Date();
        const due = new Date(dueDate)
        if (isNaN(due.getTime())) return res.status(400).json({ message: "Invalid due date" })
        if (due <= now) return res.status(400).json({ message: "Due date must be in future" })
        if (maxMarks <= 0) return res.status(400).json({ message: "maxMarks muct be greater than zero" })

        //handling attachments
        let attachments = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploaded = await uploadToCloudinary(file.buffer, "assignment_attachments")

                attachments.push({
                    public_id: uploaded.public_id,
                    url: uploaded.url,
                    secure_url: uploaded.secure_url,
                    bytes: uploaded.bytes,
                    format: uploaded.format,
                    original_filename: uploaded.original_filename
                })
            }
        }

        //creating assignment
        const assignment = await Assignment.create({
            title: title.trim(),
            description: description.trim() || "",
            dueDate: due,
            maxMarks,
            attachments,
            course: courseId,
            createdBy: req.user._id,
            isPublished: true,
            publishedAt: null,
            allowLate: true
        })

        //sending minimal data of the user who created the assignment
        await assignment.populate("createdBy", "fullName email username")


        return res.status(200).json({
            message: "Assignment created successfully",
            assignment
        })
    } catch (error) {
        console.error("Failed to create Assignment", error.message)
        return res.status(500).json({ message: "Failed to create assignment" })
    }
}

export {
    createAssignment,

}