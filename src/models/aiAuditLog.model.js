import mongoose, { mongo } from "mongoose";

const aiAuditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    role: {
        type: String,
        enum: ["admin", "teacher"],
        required: true
    },

    actionType: {
        type: String,
        required: true
    },

    fromCache: {
        type: Boolean,
        required: true
    }

}, { timestamps: true })


export const AiAuditLog = mongoose.model("AiAuditLog", aiAuditLogSchema)