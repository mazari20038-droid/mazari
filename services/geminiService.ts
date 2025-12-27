
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Initialize with required named parameter, using process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDesignFromPrompt = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Create a professional design based on this prompt: ${prompt}. The design should be clean, modern, and high resolution. Focus on good typography and balanced composition.` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Iterate through parts to find the image data as per guidelines
    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Design Generation Error:", error);
    return null;
  }
};

export const suggestColorsAndFonts = async (description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide 5 color HEX codes and 3 font pairings (Google Fonts) suitable for a design described as: "${description}". Return as a raw JSON object with keys "colors" (string array) and "fonts" (object array with "header" and "body" keys).`,
      config: {
        responseMimeType: "application/json"
      }
    });
    // Use .text property directly
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Suggestion Error:", error);
    return null;
  }
};

export const removeBackground = async (imageBase64: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/png' } },
          { text: "Remove the background of this image and return only the main subject on a transparent or clean white background." }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Background Removal Error:", error);
    return null;
  }
};