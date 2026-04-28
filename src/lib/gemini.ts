import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function generateQuizQuestions(subject: string, level: number) {
  const prompt = `Generate 5 multiple choice questions for a competitive exam. 
  Subject: ${subject}
  Level: ${level} (where 1 is easy and 10 is very hard)
  Format: JSON array of objects with fields: question, options (array of 4 strings), correctAnswer (index 0-3).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
}
