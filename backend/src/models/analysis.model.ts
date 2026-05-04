import mongoose, { Schema, Document } from "mongoose";

export interface IAnalysis extends Document {
  mainASIN: string;
  competitorASINs: string[];
  status: "pending" | "running" | "complete" | "failed";
  progress: number;
  totalListings: number;
  createdAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>({
  mainASIN: { type: String, required: true },
  competitorASINs: [{ type: String }],
  status: { type: String, default: "pending" },
  progress: { type: Number, default: 0 },
  totalListings: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAnalysis>("Analysis", AnalysisSchema);