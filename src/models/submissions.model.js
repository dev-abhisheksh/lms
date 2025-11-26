import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true
    },

    status: {
        type: String,
        enum: ["submitted", "graded", "late", "deleted"],
        default: "submitted"
    },

    isLate: {
        type: Boolean,
        default: false
    },

    submittedAt: {
        type: Date,
        default: Date.now
    },

    files: [{
        public_id: { type: String },
        url: { type: String },
        secure_url: { type: String },
        bytes: { type: Number },
        format: { type: String },
        original_filename: { type: String }
    }],

    textAnswer: {
        type: String,
        trim: true,
        default: ""
    },

    grade: {
        type: Number,
        default: null
    },

    feedback: {
        type: String,
        default: "",
        trim: true
    },

    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    gradedAt: {
        type: Date,
        default: null
    },

    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true })

submissionSchema.index({ assignment: 1, submittedAt: -1 });
submissionSchema.index({ student: 1, assignment: 1 });


export const Submission = mongoose.model("Submission", submissionSchema)