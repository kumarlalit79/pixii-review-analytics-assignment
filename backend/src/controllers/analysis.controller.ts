import { type Request, type Response } from "express";
import Analysis from "../models/analysis.model";
import Product from "../models/product.model";
import Insight from "../models/insight.model";
import { extractASIN } from "../services/scraper.service";
import { runAnalysis } from "../services/analysis.service";

export const startAnalysis = async (req: Request, res: Response): Promise<void> => {
  const { mainUrl, competitorUrls } = req.body;

  if (!mainUrl) {
    res.status(400).json({ error: "mainUrl is required" });
    return;
  }

  const mainASIN = extractASIN(mainUrl);
  if (!mainASIN) {
    res.status(400).json({ error: "Could not extract ASIN from mainUrl" });
    return;
  }

  const competitorASINs: string[] = [];
  if (competitorUrls && Array.isArray(competitorUrls)) {
    for (const url of competitorUrls.slice(0, 9)) {
      const asin = extractASIN(url);
      if (asin) competitorASINs.push(asin);
    }
  }

  const totalListings = 1 + competitorASINs.length;

  const analysis = await Analysis.create({
    mainASIN,
    competitorASINs,
    status: "pending",
    progress: 0,
    totalListings,
  });

  // fire and forget — don't await
  runAnalysis(analysis._id.toString(), mainASIN, competitorASINs);

  res.status(201).json({
    analysisId: analysis._id,
    totalListings,
    message: "Analysis started",
  });
};

export const getStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const analysis = await Analysis.findById(id);
  if (!analysis) {
    res.status(404).json({ error: "Analysis not found" });
    return;
  }

  res.json({
    status: analysis.status,
    progress: analysis.progress,
    totalListings: analysis.totalListings,
  });
};

export const getResults = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const analysis = await Analysis.findById(id);
  if (!analysis) {
    res.status(404).json({ error: "Analysis not found" });
    return;
  }

  const products = await Product.find({ analysisId: id });
  const insights = await Insight.find({ analysisId: id });

  res.json({ analysis, products, insights });
};

export const getHistory = async (req: Request, res: Response): Promise<void> => {
  const analyses = await Analysis.find().sort({ createdAt: -1 }).limit(10);
  res.json(analyses);
};