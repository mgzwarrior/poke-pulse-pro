
import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const identifyCardFromImage = async (base64Image: string): Promise<ScanResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              text: "Identify this Pokémon card. Return the name, set name, and card number in JSON format. Be extremely accurate.",
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            set: { type: Type.STRING },
            number: { type: Type.STRING },
            confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 1" },
          },
          required: ["name", "set", "number", "confidence"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return result as ScanResult;
  } catch (error) {
    console.error("Gemini Scan Error:", error);
    return null;
  }
};
