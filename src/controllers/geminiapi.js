const { GoogleGenAI } = require("@google/genai");
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

const isGeminiBusyError = (error) => {
    const status = error?.status || error?.code;
    const message = error?.message || "";

    return (
        status === 503 ||
        message.includes('"code":503') ||
        message.includes('"status":"UNAVAILABLE"') ||
        message.toLowerCase().includes("high demand")
    );
};

const getGeminiResponse = async (req, res) => {
    const prompt = req.body?.prompt;

    if (!prompt) {
        return res.status(400).json({ message: "Prompt cannot be empty." });
    }

    if (!ai) {
        return res.status(500).json({
            message: "AI service is not configured. Missing GEMINI_API_KEY.",
        });
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            generationConfig: {
                maxOutputTokens: 256,
                temperature: 0.7,
            }
        });

        return res.json({ text: response.text || "No response generated." });
    } catch (error) {
        console.error(
            "Error calling Gemini API:",
            error?.message || error,
            error?.stack || "",
        );

        if (isGeminiBusyError(error)) {
            return res.status(503).json({
                message:
                    "AI service is busy right now. Please wait a moment and try again.",
            });
        }

        return res.status(502).json({ message: "Failed to get response from AI service." });
    }
};

module.exports = getGeminiResponse;
