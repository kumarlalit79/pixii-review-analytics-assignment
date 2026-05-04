import mongoose, { Schema, Document } from "mongoose";

export interface IInsight extends Document {
  analysisId: string;
  asin: string;
  purchaseCriteria: string[];
  complaints: string[];
  sentimentScore: number;
  differentiators: string[];
  reviewsAnalyzed: number;
  reviewsSample: string[];
}

const InsightSchema = new Schema<IInsight>({
  analysisId: { type: String, required: true },
  asin: { type: String, required: true },
  purchaseCriteria: [{ type: String }],
  complaints: [{ type: String }],
  sentimentScore: { type: Number, default: 0 },
  differentiators: [{ type: String }],
  reviewsAnalyzed: { type: Number, default: 0 },
  reviewsSample: [{ type: String }],
});

export default mongoose.model<IInsight>("Insight", InsightSchema);