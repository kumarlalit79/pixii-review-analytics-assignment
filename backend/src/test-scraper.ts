import {
  scrapeListingPage,
  scrapeReviews,
  extractASIN,
} from "./services/scraper.service";
import { analyzeReviews } from "./services/gemini.service";

const testASIN = "B0DXNYJRMH";

const run = async () => {
  console.log("Testing listing scrape...");
  const listing = await scrapeListingPage(testASIN);
  console.log("Listing result:", listing);

  console.log("\nTesting reviews scrape (page 1 only)...");
  const reviews = await scrapeReviews(testASIN);
  console.log(`Got ${reviews.length} reviews`);
  console.log("First 3 reviews:");
  reviews
    .slice(0, 3)
    .forEach((r, i) => console.log(`[${i + 1}]`, r.substring(0, 100)));

  // gemini testing
  console.log("\nTesting Gemini analysis...");
  const insights = await analyzeReviews(
    testASIN,
    listing?.title || "Unknown Product",
    reviews,
  );

  console.log("Insights:", JSON.stringify(insights, null, 2));
};

run();
