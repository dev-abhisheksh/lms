const MODEL_NAME = "gemini-2.5-flash-lite";
const API_VERSION = "v1beta";

const GEMINI_URL = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}:generateContent`;

export async function generateWithGemini(prompt) {
    try {
        const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 200
                }
            })
        });

        const data = await res.json();

        if (data.error) {
            console.error(`AI Studio Error (${data.error.code}): ${data.error.message}`);
            if (data.error.code === 404) {
                console.warn("Retrying with fallback model alias...");
                return await fallbackGenerate(prompt);
            }
            throw new Error(data.error.message);
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("AI Generation Failed:", error.message);
        throw error;
    }
}
