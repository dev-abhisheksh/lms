import { generateWithGemini } from "../services/ai/gemini.service.js";
import { enhanceLessonDescriptionPrompt, moduleDescriptionPrompt, reWriteAssignemtQuestionPrompt } from "../services/ai/prompts.js";

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

const enhanceLessonDescription = async (req, res) => {
    const { description } = req.body
    if (!description) {
        return res.status(400).json({ message: "lesson description is required" })
    }

    if (description.trim().length < 10) {
        return res.status(400).json({ message: "Lesson description is too short to enhance" })
    }

    if (description.trim().length) {
        return res.status(400).json({ message: "Lesson description is too large for AI Enhancement" })
    }

    const prompt = enhanceLessonDescriptionPrompt({ description })

    const enhanced = await generateWithGemini(prompt)

    res.status(200).json({
        enhancedDescription: enhanced
    })
}

export {
    generateModuleDescription,
    reWriteAssignmentQuestion,
    enhanceLessonDescription
}