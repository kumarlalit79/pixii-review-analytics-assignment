import { create } from "zustand";

interface Product {
  _id: string;
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

interface Insight {
  _id: string;
  asin: string;
  purchaseCriteria: string[];
  complaints: string[];
  sentimentScore: number;
  differentiators: string[];
  reviewsAnalyzed: number;
  reviewsSample: string[];
}

interface AnalysisResult {
  analysis: { _id: string; status: string; mainASIN: string };
  products: Product[];
  insights: Insight[];
}

interface AnalysisStore {
  analysisId: string | null;
  status: string;
  progress: number;
  totalListings: number;
  results: AnalysisResult | null;
  setAnalysisStarted: (id: string, total: number) => void;
  setStatus: (status: string, progress: number) => void;
  setResults: (results: AnalysisResult) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  analysisId: null,
  status: "",
  progress: 0,
  totalListings: 0,
  results: null,
  setAnalysisStarted: (id, total) =>
    set({ analysisId: id, totalListings: total, status: "pending", results: null }),
  setStatus: (status, progress) => set({ status, progress }),
  setResults: (results) => set({ results }),
  reset: () =>
    set({ analysisId: null, status: "", progress: 0, totalListings: 0, results: null }),
}));