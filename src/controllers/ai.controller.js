import { generateWithGemini } from "../services/ai/gemini.service.js";
import { moduleDescriptionPrompt } from "../services/ai/prompts.js";

export const generateModuleDescription = async (req, res) => {
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