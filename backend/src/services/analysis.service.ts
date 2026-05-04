import Analysis from "../models/analysis.model";
import Product from "../models/product.model";
import Insight from "../models/insight.model";
import { scrapeListingPage, scrapeReviews } from "./scraper.service";
import { analyzeReviews } from "./gemini.service";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const runAnalysis = async (
  analysisId: string,
  mainASIN: string,
  competitorASINs: string[],
): Promise<void> => {
  const allASINs = [mainASIN, ...competitorASINs];

  try {
    await Analysis.findByIdAndUpdate(analysisId, {
      status: "running",
      progress: 0,
    });

    for (let i = 0; i < allASINs.length; i++) {
      const asin = allASINs[i];
      if (!asin) {
        console.log("Skipping undefined ASIN");
        continue;
      }
      const isMain = asin === mainASIN;

      console.log(`Processing ${i + 1}/${allASINs.length}: ${asin}`);

      // scrape listing
      const listingData = await scrapeListingPage(asin);

      if (!listingData) {
        console.log(`Skipping ${asin} — listing scrape failed`);
        await Analysis.findByIdAndUpdate(analysisId, { progress: i + 1 });
        continue;
      }

      // save product
      await Product.create({
        analysisId,
        asin,
        title: listingData.title,
        price: listingData.price,
        rating: listingData.rating,
        reviewCount: listingData.reviewCount,
        bsr: listingData.bsr,
        estimatedMonthlySales: listingData.estimatedMonthlySales,
        estimatedMonthlyRevenue: listingData.estimatedMonthlyRevenue,
        isMain,
      });

      // scrape reviews
      await delay(2000);
      const reviews = await scrapeReviews(asin);

      // gemini analysis
      const insights = await analyzeReviews(asin, listingData.title, reviews);

      // save insights
      await Insight.create({
        analysisId,
        asin,
        purchaseCriteria: insights.purchaseCriteria,
        complaints: insights.complaints,
        sentimentScore: Math.round(insights.sentimentScore * 10) / 10,
        differentiators: insights.differentiators,
        reviewsAnalyzed: reviews.length,
        reviewsSample: reviews.slice(0, 3),
      });

      // update progress
      await Analysis.findByIdAndUpdate(analysisId, { progress: i + 1 });

      // delay between listings to avoid hammering scraper credits
      if (i < allASINs.length - 1) await delay(3000);
    }

    await Analysis.findByIdAndUpdate(analysisId, { status: "complete" });
    console.log(`Analysis ${analysisId} complete`);
  } catch (error) {
    console.error(`Analysis ${analysisId} failed:`, error);
    await Analysis.findByIdAndUpdate(analysisId, { status: "failed" });
  }
};
