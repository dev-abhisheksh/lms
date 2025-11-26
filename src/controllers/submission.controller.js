import { Submission } from "../models/submissions.model.js";
import { Assignment } from "../models/assignment.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { Course } from "../models/course.model.js";
import { CourseEnrollment } from "../models/courseEnrollment.model.js"

const createSubmission = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        if (!assignmentId) return res.status(400).json({ message: "Assignment ID is reqiored" })

        if (req.user.role !== "student") return res.status(403).json({ message: "Only students are allowed for submissions" })

        //confirming if the assignments exits, if yes returning basic data about it
        const assignment = await Assignment.findById(assignmentId).select("title dueDate isPublished course")
        if (!assignment) return res.status(404).json({ message: "Assignment not found" })

        //checking if the assignment is published or not
        if (!assignment.isPublished) return res.status(400).json({ message: "Assignment is not yet published" })

        //checking if the user is enrolled in the course or not
        const enrollment = await CourseEnrollment.findOne({ user: req.user._id, course: assignment.course })
        if (!enrollment) return res.status(403).json({ message: "User is not enrolled in the couse" })

        //checking whether the user is already submitted the assignment
        const existingSubmission = await Submission.findOne({ student: req.user._id, assignment: assignmentId, status: { $ne: "deleted" } })
        if (existingSubmission) return res.status(409).json({ message: "You've already submitted the assignment" })

        //whether the submission is late
        const now = new Date();
        const isLate = now > assignment.dueDate;
        let status = isLate ? "late" : "submitted"

        //file or resourse uploads
        const filesArray = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploaded = await uploadToCloudinary(file.buffer, "submissions");
                filesArray.push({
                    public_id: uploaded.public_id,
                    url: uploaded.url,
                    secure_url: uploaded.secure_url,
                    bytes: uploaded.bytes,
                    format: uploaded.format,
                    original_filename: uploaded.original_filename
                })
            }
        }

        if (filesArray.length === 0 && !req.body.textAnswer) {
            return res.status(400).json({ message: "Please either provide a file or text answers" })
        }

        const submission = await Submission.create({
            student: req.user._id,
            assignment: assignmentId,
            textAnswer: req.body.textAnswer || "",
            files: filesArray,
            submittedAt: now,
            isLate,
            status
        })

        return res.status(201).json({
            message: isLate
                ? "Submission uploaded successfully (marked as late)"
                : "Submission uploaded successfully",
            submission
        })
    } catch (error) {
        console.error("Submission Error:", error);
        return res.status(500).json({ message: "Failed to create submission" });
    }
};


export {
    createSubmission
};
