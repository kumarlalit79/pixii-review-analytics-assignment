import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const analyzeReviews = async (
  asin: string,
  productTitle: string,
  reviews: string[],
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

  const reviewText =
    reviews.length > 0
      ? reviews.slice(0, 20).join("\n---\n")
      : "No customer reviews available yet.";

  const prompt = `You are an Amazon product analyst. Analyze these customer reviews for "${productTitle}" (ASIN: ${asin}).

  ${reviews.length > 0 ? `Customer Reviews:\n${reviewText}` : `No reviews are available. Base your analysis on the product title and name alone.`}


Reviews:
Respond ONLY with a valid JSON object. No markdown, no backticks, no explanation. Just raw JSON.

{
  "purchaseCriteria": ["top 5 reasons customers buy this product"],
  "complaints": ["top 3 complaints or negatives"],
  "sentimentScore": ${reviews.length > 0 ? "<number from 1 to 5 based on reviews>" : "0"},
  "differentiators": ["top 3 things that make this product stand out"]
}`;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  try {
    let response;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
        });
        break;
      } catch (err: any) {
        if (attempt < 3 && err?.status === 503) {
          console.log(`Gemini 503, retrying attempt ${attempt + 1}...`);
          await delay(5000 * attempt);
        } else {
          throw err;
        }
      }
    }

    const text = response?.text ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      purchaseCriteria:
        parsed.purchaseCriteria ?? defaultResponse.purchaseCriteria,
      complaints: parsed.complaints ?? defaultResponse.complaints,
      sentimentScore: parsed.sentimentScore ?? 3,
      differentiators:
        parsed.differentiators ?? defaultResponse.differentiators,
    };
  } catch (error) {
    console.error(`Gemini analysis failed for ${asin}:`, error);
    return defaultResponse;
  }
};
