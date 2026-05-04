import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  analysisId: string;
  asin: string;
  title: string;
  price: number;
  rating: number;
  reviewCount: number;
  bsr: number;
  estimatedMonthlySales: number;
  estimatedMonthlyRevenue: number;
  isMain: boolean;
}

const ProductSchema = new Schema<IProduct>({
  analysisId: { type: String, required: true },
  asin: { type: String, required: true },
  title: { type: String, default: "" },
  price: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  bsr: { type: Number, default: 0 },
  estimatedMonthlySales: { type: Number, default: 0 },
  estimatedMonthlyRevenue: { type: Number, default: 0 },
  isMain: { type: Boolean, default: false },
});

export default mongoose.model<IProduct>("Product", ProductSchema);