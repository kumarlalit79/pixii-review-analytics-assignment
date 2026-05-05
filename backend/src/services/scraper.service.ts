import axios from "axios";
import * as cheerio from "cheerio";

type ScraperApiOptions = {
  premium?: boolean;
};

const buildUrl = (
  targetUrl: string,
  options: ScraperApiOptions = {},
): string => {
  const apiKey = process.env.SCRAPERAPI_KEY;
  if (!apiKey) throw new Error("SCRAPERAPI_KEY is not configured");

  const params = new URLSearchParams({
    api_key: apiKey,
    url: targetUrl,
    country_code: "in",
    device_type: "desktop",
  });

  if (options.premium) params.set("premium", "true");

  return `https://api.scraperapi.com?${params.toString()}`;
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const FIRST_REVIEW_PAGE_LIMIT = 20;
const REVIEW_SCRAPE_ATTEMPTS = 2;
const REVIEW_REQUEST_TIMEOUT_MS = 30000;

const axiosInstance = axios.create({
  timeout: 60000,
  headers: {
    "Accept-Language": "en-US,en;q=0.9",
    Accept: "text/html",
  },
});

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
      ? ` status ${error.response.status}`
      : "";
    return `${error.code ?? "AXIOS_ERROR"}${status}: ${error.message}`;
  }

  return error instanceof Error ? error.message : String(error);
};

const isAmazonBlockedPage = (pageTitle: string, html: string): boolean => {
  const normalizedTitle = pageTitle.toLowerCase();
  const normalizedHtml = html.toLowerCase();

  return (
    normalizedTitle.includes("robot check") ||
    normalizedTitle.includes("sign in") ||
    normalizedTitle.includes("sign-in") ||
    normalizedTitle.includes("captcha") ||
    normalizedHtml.includes("enter the characters you see below")
  );
};

const extractAmazonAjaxHtml = (payload: string): string => {
  const htmlParts: string[] = [];

  for (const rawLine of payload.split(/\r?\n/)) {
    const line = rawLine.replace(/^&&&/, "").trim();
    if (!line.startsWith("[")) continue;

    try {
      const parsed = JSON.parse(line);
      if (!Array.isArray(parsed)) continue;

      for (const item of parsed) {
        if (typeof item === "string" && item.includes("<")) {
          htmlParts.push(item);
        }
      }
    } catch {
      // Amazon's review-render endpoint can mix JSON rows with non-JSON lines.
    }
  }

  return htmlParts.join("\n");
};

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
    console.error(
      `Failed to scrape listing for ASIN ${asin}: ${getErrorMessage(error)}`,
    );
    return null;
  }
};

export const scrapeReviews = async (asin: string): Promise<string[]> => {
  const reviewTargets: Array<{
    label: string;
    url: string;
    options?: ScraperApiOptions;
    ajax?: boolean;
  }> = [
    {
      label: "product page",
      url: `https://www.amazon.in/dp/${asin}`,
    },
    {
      label: "review page 1 premium",
      url: `https://www.amazon.in/product-reviews/${asin}/?ie=UTF8&reviewerType=all_reviews&pageNumber=1&sortBy=recent`,
      options: { premium: true },
    },
    {
      label: "review page 1",
      url: `https://www.amazon.in/product-reviews/${asin}/?ie=UTF8&reviewerType=all_reviews&pageNumber=1&sortBy=recent`,
    },
    {
      label: "review-render ajax page 1",
      url: `https://www.amazon.in/hz/reviews-render/ajax/reviews/get/ref=cm_cr_getr_d_paging_btm_next_1?ie=UTF8&reviewerType=all_reviews&pageNumber=1&asin=${asin}&sortBy=recent`,
      ajax: true,
    },
  ];

  for (const target of reviewTargets) {
    for (let attempt = 1; attempt <= REVIEW_SCRAPE_ATTEMPTS; attempt++) {
      try {
        const url = buildUrl(target.url, target.options);
        const response = await axiosInstance.get(url, {
          timeout: REVIEW_REQUEST_TIMEOUT_MS,
        });
        const responseHtml = String(response.data);
        const ajaxHtml = target.ajax ? extractAmazonAjaxHtml(responseHtml) : "";
        const html = ajaxHtml || responseHtml;
        const $ = cheerio.load(html);

        const pageTitle = $("title").text().trim();
        const isBlocked = isAmazonBlockedPage(pageTitle, responseHtml);

        if (isBlocked) {
          console.log(
            `Amazon blocked ${target.label} for ${asin} on attempt ${attempt}: ${pageTitle}`,
          );
          await delay(1000 * attempt);
          break;
        }

        const reviews = extractReviewTexts($);

        console.log("Page title:", pageTitle || target.label);
        console.log("HTML length:", html.length);
        console.log(
          `Extracted ${reviews.length} reviews for ${asin} from ${target.label}`,
        );

        if (reviews.length > 0) return reviews;

        await delay(1000 * attempt);
      } catch (error) {
        console.error(
          `Review scrape failed for ${asin} on attempt ${attempt}: ${getErrorMessage(error)}`,
        );
        await delay(1000 * attempt);
      }
    }
  }

  console.log(`No reviews found for ${asin} after all first-page attempts`);
  return [];
};

const extractReviewTexts = ($: cheerio.CheerioAPI): string[] => {
  const seen = new Set<string>();
  const reviews: string[] = [];

  const addReview = (text: string) => {
    const cleaned = text
      .replace(/Read more\.\.\./gi, "")
      .replace(/Read more/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    if (cleaned.length <= 20 || seen.has(cleaned)) return;

    seen.add(cleaned);
    reviews.push(cleaned);
  };

  $("[data-hook='review']").each((_, el) => {
    const reviewBody =
      $(el).find("[data-hook='review-body']").text().trim() ||
      $(el).find(".review-text-content").text().trim() ||
      $(el).find("[data-hook='review-collapsed']").text().trim() ||
      $(el).find("[data-hook='review-expanded']").text().trim() ||
      $(el).find(".cr-original-review-content").text().trim();

    addReview(reviewBody);
  });

  if (reviews.length === 0) {
    $(
      [
        "[data-hook='review-body']",
        "[data-hook='review-collapsed']",
        "[data-hook='review-expanded']",
        ".review-text-content",
        ".cr-original-review-content",
        ".reviewText",
      ].join(", "),
    ).each((_, el) => addReview($(el).text()));
  }

  return reviews.slice(0, FIRST_REVIEW_PAGE_LIMIT);
};
