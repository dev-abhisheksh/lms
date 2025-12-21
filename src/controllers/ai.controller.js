import { AiAuditLog } from "../models/aiAuditLog.model.js";
import { generateWithGemini } from "../services/ai/gemini.service.js";
import { enhanceAssignmentDescriptionPrompt, enhanceCourseDescriptionPrompt, enhanceLessonDescriptionPrompt, enhanceModuleDescriptionPrompt, moduleDescriptionPrompt, reWriteAssignemtQuestionPrompt } from "../services/ai/prompts.js";
import { client } from "../utils/redisClient.js";
import crypto from "crypto";

const hashText = (text) => {
    return crypto
        .createHash("sha256")
        .update(text)
        .digest("hex");
};


const generateModuleDescription = async (req, res) => {
    try {
        const { course, module, audience } = req.body

        if (!course || !module) return res.status(400).json({ message: "Missing required fields" })

        const prompt = moduleDescriptionPrompt({
            course,
            module,
            audience: audience || "Beginner"
        })

        const text = await generateWithGemini(prompt)

        res.status(200).json({
            generatedText: text
        })
    } catch (error) {
        console.log("AI generation failed", error)
        return res.status(500).json({ message: "AI generation failed" })
    }
}

const reWriteAssignmentQuestion = async (req, res) => {
    const { question } = req.body;
    if (!question || question.trim().length < 10) {
        return res.status(400).json({ message: "Assignment question too short" })
    }

    const prompt = reWriteAssignemtQuestionPrompt({ question })

    const rewritten = await generateWithGemini(prompt)

    res.status(200).json({
        improvedQuestion: rewritten
    })
}

const enhanceDescription = async (req, res) => {
    try {
        const { type, description } = req.body
        if (!type || !description) return res.status(400).json({ message: "Both fields are required" })

        const text = description.trim()

        const cacheKey = `ai:enhance:${type}:${hashText(description)}`
        const cached = await client.get(cacheKey)
        if (cached) {
            return res.status(200).json({
                enhancedDescription: cached,
                fromCache: true
            });
        }


        if (text.length < 10) {
            return res.status(400).json({ message: "Description is too short to ehance" })
        }

        if (text.length > 800) {
            return res.status(400).json({ message: "Description is too large for AI Enhance" })
        }

        let prompt;

        switch (type) {
            case "course":
                prompt = enhanceCourseDescriptionPrompt({ description: text })
                break;

            case "module":
                prompt = enhanceModuleDescriptionPrompt({ description: text })
                break

            case "assignment":
                prompt = enhanceAssignmentDescriptionPrompt({ description: text })
                break

            case "lesson":
                prompt = enhanceLessonDescriptionPrompt({ description: text })
                break

            default:
                return res.status(400).json({ message: "Invalid description type" })
        }

        const enhanced = await generateWithGemini(prompt)

        await client.set(cacheKey, enhanced, "EX", 60 * 60 * 24)

        res.status(200).json({
            enhancedDescription: enhanced,
            fromCache: false
        })

        AiAuditLog.create({
            user: req.user?._id,
            role: req.user?.role,
            fromCache: false,
            actionType: `enhance_${type}_description`
        }).catch(error => {
            console.error("AiAuditLog failed", error.message)
        })

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "AI enhancement failed" });
    }
}

export {
    generateModuleDescription,
    reWriteAssignmentQuestion,
    enhanceDescription
}