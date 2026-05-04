import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY 
});

export const analyzeReviews = async (
  asin: string,
  productTitle: string,
  reviews: string[]
): Promise<{
  purchaseCriteria: string[];
  complaints: string[];
  sentimentScore: number;
  differentiators: string[];
}> => {
  const defaultResponse = {
    purchaseCriteria: ["Quality", "Value for money", "Performance"],
    complaints: ["No major complaints found"],
    sentimentScore: 3,
    differentiators: ["Competitive pricing"],
  };

  if (reviews.length === 0) return defaultResponse;

  const reviewText = reviews.slice(0, 5).join("\n---\n");

  const prompt = `You are an Amazon product analyst. Analyze these customer reviews for "${productTitle}" (ASIN: ${asin}).

Reviews:
${reviewText}

Respond ONLY with a valid JSON object. No markdown, no backticks, no explanation. Just raw JSON.

{
  "purchaseCriteria": ["top 5 reasons customers buy this product"],
  "complaints": ["top 3 complaints or negatives"],
  "sentimentScore": <number from 1 to 5>,
  "differentiators": ["top 3 things that make this product stand out"]
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      purchaseCriteria: parsed.purchaseCriteria ?? defaultResponse.purchaseCriteria,
      complaints: parsed.complaints ?? defaultResponse.complaints,
      sentimentScore: parsed.sentimentScore ?? 3,
      differentiators: parsed.differentiators ?? defaultResponse.differentiators,
    };
  } catch (error) {
    console.error(`Gemini analysis failed for ${asin}:`, error);
    return defaultResponse;
  }
};