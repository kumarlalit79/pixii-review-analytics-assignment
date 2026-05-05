import axios from "axios";
import * as cheerio from "cheerio";

const buildUrl = (targetUrl: string): string => {
  const apiKey = process.env.SCRAPERAPI_KEY;
  return `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(
    targetUrl,
  )}&country_code=in`;
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const axiosInstance = axios.create({
  timeout: 60000,
  headers: {
    "Accept-Language": "en-US,en;q=0.9",
    Accept: "text/html",
  },
});

export const extractASIN = (url: string): string | null => {
  const match = url.match(/\/dp\/([A-Z0-9]{10})/);
  return match ? (match[1] ?? null) : null;
};

export const scrapeListingPage = async (asin: string) => {
  const url = buildUrl(`https://www.amazon.in/dp/${asin}`);

  try {
    const response = await axiosInstance.get(url);
    const $ = cheerio.load(response.data);

    const title =
      $("#productTitle").text().trim() ||
      $("h1.a-size-large").text().trim() ||
      "";

    const priceText =
      $(".a-price .a-offscreen").first().text().trim() ||
      $("#priceblock_ourprice").text().trim() ||
      "";
    const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;

    const ratingText = $("span.a-icon-alt").first().text().trim();
    const rating = parseFloat(ratingText.split(" ")[0] ?? "0") || 0;

    const reviewCountText = $("#acrCustomerReviewText").first().text().trim();
    const reviewCount =
      parseInt(reviewCountText.replace(/[^0-9]/g, ""), 10) || 0;

    const fullText =
      $("#prodDetails").text() +
      $("#detailBullets_feature_div").text() +
      $("#SalesRank").text();
    const bsrMatch = fullText.match(/#([\d,]+)\s+in/);
    const bsr = bsrMatch
      ? parseInt((bsrMatch[1] ?? "0").replace(/,/g, ""), 10)
      : 0;

    const estimatedMonthlySales =
      bsr > 0 ? Math.round(1000 / Math.pow(bsr, 0.6)) : 0;
    const estimatedMonthlyRevenue = Math.round(estimatedMonthlySales * price);

    return {
      asin,
      title,
      price,
      rating,
      reviewCount,
      bsr,
      estimatedMonthlySales,
      estimatedMonthlyRevenue,
    };
  } catch (error) {
    console.error(`Failed to scrape listing for ASIN ${asin}:`, error);
    return null;
  }
};

export const scrapeReviews = async (asin: string): Promise<string[]> => {
  try {
    const url = buildUrl(`https://www.amazon.in/dp/${asin}`);
    const response = await axiosInstance.get(url);
    const $ = cheerio.load(response.data);

    const pageTitle = $("title").text();
    if (
      pageTitle.toLowerCase().includes("robot check") ||
      pageTitle.toLowerCase().includes("sign in") ||
      pageTitle.toLowerCase().includes("captcha")
    ) {
      console.log("Blocked by Amazon on reviews page:", pageTitle);
      return [];
    }

    const reviews: string[] = [];

    $("[data-hook='review']").each((_, el) => {
      const text = $(el).find("[data-hook='review-body'] span").text().trim();

      if (text && text.length > 20) {
        reviews.push(text);
      }
    });

    if (reviews.length === 0) {
      $("[data-hook='review-body']").each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 20) reviews.push(text);
      });
    }

    if (reviews.length === 0) {
      $(".review-text-content span").each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 20) reviews.push(text);
      });
    }

    console.log("Page title:", $("title").text());
    console.log("HTML length:", response.data.length);

    console.log(`Extracted ${reviews.length} reviews from product page`);

    if (reviews.length === 0) {
      console.log("No reviews found — proceeding with empty reviews");
      return [];
    }

    return reviews
      .map((r) =>
        r
          .replace(/Read more\.\.\./gi, "")
          .replace(/Read more/gi, "")
          .trim(),
      )
      .filter((r) => r.length > 20)
      .slice(0, 20);
  } catch (error) {
    console.error("Review scrape failed:", error);

    return [];
  }
};
