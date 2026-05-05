import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

type ReviewAnalysis = {
  purchaseCriteria: string[];
  complaints: string[];
  sentimentScore: number;
  differentiators: string[];
};

const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    purchaseCriteria: {
      type: "array",
      items: { type: "string" },
    },
    complaints: {
      type: "array",
      items: { type: "string" },
    },
    sentimentScore: {
      type: "number",
    },
    differentiators: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "purchaseCriteria",
    "complaints",
    "sentimentScore",
    "differentiators",
  ],
};

const normalizeStringArray = (value: unknown, fallback: string[]) => {
  if (!Array.isArray(value)) return fallback;

  const normalized = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return normalized.length > 0 ? normalized : fallback;
};

const parseGeminiJson = (text: string) => {
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    const jsonStart = clean.indexOf("{");
    const jsonEnd = clean.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      throw new Error(`Gemini returned non-JSON text: ${clean.slice(0, 200)}`);
    }

    return JSON.parse(clean.slice(jsonStart, jsonEnd + 1));
  }
};

const buildReviewBasedFallback = (reviews: string[]): ReviewAnalysis => {
  const text = reviews.join(" ").toLowerCase();

  const criteria = [
    { label: "Dandruff control", terms: ["dandruff", "flakes", "flaky"] },
    { label: "Reduced hair fall", terms: ["hair fall", "hairfall"] },
    { label: "Effective results", terms: ["effective", "works", "result"] },
    { label: "Good value", terms: ["price", "deal", "value", "rs", "₹"] },
    { label: "Gentle cleansing", terms: ["clean", "scalp", "soft", "smooth"] },
  ]
    .filter(({ terms }) => terms.some((term) => text.includes(term)))
    .map(({ label }) => label)
    .slice(0, 5);

  const complaints = [
    { label: "Packaging or quantity concerns", terms: ["packaging", "package", "quantity", "used"] },
    { label: "Scent preference issues", terms: ["scent", "smell", "fragrance"] },
    { label: "Dryness or frizz concerns", terms: ["dry", "dryout", "frizzy", "frizz"] },
    { label: "Hair fall concerns", terms: ["hair fall", "hairfall"] },
  ]
    .filter(({ terms }) => terms.some((term) => text.includes(term)))
    .map(({ label }) => label)
    .slice(0, 3);

  return {
    purchaseCriteria:
      criteria.length > 0 ? criteria : ["Positive customer feedback"],
    complaints:
      complaints.length > 0 ? complaints : ["No repeated complaint pattern found"],
    sentimentScore: text.includes("cons") || text.includes("complaint") ? 3.5 : 4,
    differentiators:
      criteria.length > 0 ? criteria.slice(0, 3) : ["Review-backed product appeal"],
  };
};

export const analyzeReviews = async (
  asin: string,
  productTitle: string,
  reviews: string[],
): Promise<ReviewAnalysis> => {
  const defaultResponse: ReviewAnalysis = {
    purchaseCriteria: ["Product features", "Brand consideration", "Price point"],
    complaints: ["Review scrape unavailable"],
    sentimentScore: 3,
    differentiators: ["Listed product specifications"],
  };

  if (reviews.length === 0) {
    const title = productTitle.toLowerCase();
    const criteria = [
      title.includes("camera") ? "Camera quality" : "",
      title.includes("ram") || title.includes("storage") ? "RAM and storage" : "",
      title.includes("battery") || title.includes("mah") ? "Battery life" : "",
      title.includes("charging") ? "Fast charging" : "",
      title.includes("display") || title.includes("fhd") ? "Display quality" : "",
    ].filter(Boolean);

    return {
      purchaseCriteria:
        criteria.length > 0 ? criteria : defaultResponse.purchaseCriteria,
      complaints: ["Could not extract review text from Amazon page"],
      sentimentScore: 3,
      differentiators:
        criteria.length > 0 ? criteria.slice(0, 3) : defaultResponse.differentiators,
    };
  }

  const fallbackResponse = buildReviewBasedFallback(reviews);
  const reviewText = reviews.slice(0, 20).join("\n---\n");

  const prompt = `You are an Amazon product analyst. Analyze these customer reviews for "${productTitle}" (ASIN: ${asin}).

Customer Reviews:
${reviewText}

Respond ONLY with a valid JSON object matching this shape. No markdown, no backticks, no explanation.

{
  "purchaseCriteria": ["specific reason from these reviews", "specific reason from these reviews"],
  "complaints": ["specific complaint from these reviews"],
  "sentimentScore": 4.2,
  "differentiators": ["specific standout point from these reviews"]
}`;

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  try {
    let response;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: ANALYSIS_SCHEMA,
          },
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
    const parsed = parseGeminiJson(text);
    const sentimentScore = Number(parsed.sentimentScore);

    return {
      purchaseCriteria:
        normalizeStringArray(parsed.purchaseCriteria, fallbackResponse.purchaseCriteria),
      complaints: normalizeStringArray(parsed.complaints, fallbackResponse.complaints),
      sentimentScore: Number.isFinite(sentimentScore)
        ? Math.min(5, Math.max(1, sentimentScore))
        : fallbackResponse.sentimentScore,
      differentiators:
        normalizeStringArray(parsed.differentiators, fallbackResponse.differentiators),
    };
  } catch (error) {
    console.error(`Gemini analysis failed for ${asin}:`, error);
    return fallbackResponse;
  }
};
