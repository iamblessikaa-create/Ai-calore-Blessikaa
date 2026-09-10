import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON payload parser
  app.use(express.json({ limit: "25mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Blessikaa Health & Nutrition" });
  });

  // Server-side Gemini API for Food Image Analysis
  app.post("/api/ai/analyze-food", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", userNotes } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          fallback: true,
          message: "No Gemini API key detected in environment. Using smart local recognition engine.",
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Analyze this food image in detail for a health & nutrition calorie tracking app.
Identify all visible food and beverage items on the plate/meal.
Estimate realistic portion sizes in grams or standard servings, and calculate total calories, protein (g), carbs (g), and fat (g).
Micronutrients: estimate fiber (g), sugar (g), and sodium (mg).
Provide a breakdown of each component item.

Return valid JSON adhering strictly to this schema:
{
  "dishName": "Short descriptive dish name",
  "confidenceScore": 0.94,
  "estimatedWeightGrams": 350,
  "calories": 480,
  "protein": 34,
  "carbs": 42,
  "fat": 18,
  "fiber": 7,
  "sugar": 5,
  "sodium": 620,
  "healthScore": 88,
  "macroRatio": {
    "proteinPct": 30,
    "carbsPct": 45,
    "fatPct": 25
  },
  "items": [
    {
      "name": "Grilled Chicken Breast",
      "portion": "150g",
      "calories": 240,
      "protein": 31,
      "carbs": 0,
      "fat": 5
    }
  ],
  "nutritionAdvice": "High protein meal with complex carbs, perfect for recovery."
}`;

      const contents: any = [];
      if (imageBase64) {
        // Strip data url header if present
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
        contents.push({
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || "image/jpeg",
          },
        });
      }

      contents.push({
        text: prompt + (userNotes ? `\nUser additional meal context: "${userNotes}"` : ""),
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
        },
      });

      const rawText = response.text || "{}";
      const parsedData = JSON.parse(rawText);
      return res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error("Gemini Food Analysis Error:", error?.message || error);
      return res.status(200).json({
        fallback: true,
        error: error?.message || "AI analysis failed",
      });
    }
  });

  // Server-side Gemini API for Voice/Text Quick Logging
  app.post("/api/ai/parse-text-meal", async (req, res) => {
    try {
      const { textInput } = req.body;
      if (!textInput || typeof textInput !== "string") {
        return res.status(400).json({ error: "Missing textInput" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          fallback: true,
          message: "Local fallback parsing",
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Convert this natural language meal log into structured nutritional data:
"${textInput}"

Extract all food items, estimate portions and nutritional values (calories, protein in g, carbs in g, fat in g).
Return valid JSON matching this schema:
{
  "dishName": "Quick summary meal name",
  "calories": 520,
  "protein": 28,
  "carbs": 60,
  "fat": 16,
  "fiber": 6,
  "sugar": 8,
  "sodium": 540,
  "items": [
    {
      "name": "Food item name",
      "portion": "e.g. 2 large",
      "calories": 140,
      "protein": 12,
      "carbs": 1,
      "fat": 10
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ text: prompt }],
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsedData = JSON.parse(response.text || "{}");
      return res.json({ success: true, data: parsedData });
    } catch (err: any) {
      console.error("Text Meal Parsing Error:", err?.message || err);
      return res.status(200).json({ fallback: true, error: err?.message });
    }
  });

  // Server-side Gemini API for AI Nutritional Coach Chat
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, userProfile, goals, consumed } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(200).json({
          fallback: true,
          message: "No Gemini API key in environment. Using smart local nutrition intelligence.",
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are a supportive, knowledgeable AI Nutritional Coach in a health and calorie tracking app.
The user's daily targets:
- Calorie target: ${goals?.calories || 1703} kcal
- Protein target: ${goals?.protein || 125}g
- Carbs target: ${goals?.carbs || 208}g
- Fat target: ${goals?.fat || 37}g
- Current weight: ${userProfile?.weightKg || 80} kg
- Target weight: ${userProfile?.targetWeightKg || 70} kg
${consumed ? `Today they have consumed ${consumed.calories || 0} kcal, ${consumed.protein || 0}g protein, ${consumed.carbs || 0}g carbs, ${consumed.fat || 0}g fat.` : ""}

Guidelines:
- Keep answers warm, encouraging, practical, and clear.
- Provide concrete calorie counts and macro estimates whenever suggesting foods or meal plans.
- If the user asks for a meal plan (e.g. 3-day keto meal plan for 2300 kcal), format it with clean bold headings, bullet points, meals, and macro breakdowns.
- Keep responses readable on mobile devices.`;

      const formattedContents = (messages || []).map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
        },
      });

      return res.json({
        success: true,
        reply: response.text || "I am here to help you reach your health goals!",
      });
    } catch (err: any) {
      console.error("AI Chat Error:", err?.message || err);
      return res.status(200).json({ fallback: true, error: err?.message });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Blessikaa Health & Nutrition server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
