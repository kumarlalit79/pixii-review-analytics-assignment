# Amazon Review Analytics

Built for the Pixii.ai founding engineer assignment.

**Live:** https://pixii-review-analyticss.onrender.com/

**Repo:** https://github.com/kumarlalit79/pixii-review-analytics-assignment.git

---

## What it does

Amazon Review Analytics lets Amazon sellers analyze their product listing alongside up to 9 competitor listings in a single run. The user pastes Amazon.in product URLs, and the tool scrapes each listing for product data including title, price, rating, review count, Best Seller Rank, and customer reviews. It then sends the extracted reviews to Gemini AI, which returns structured analysis covering purchase criteria, common complaints, product differentiators, and a sentiment score for each listing. The dashboard displays all results side by side with estimated monthly revenue, sentiment breakdowns, and a competitive comparison table so sellers can see exactly where they stand against competitors.

## Live Demo

Open the live link above and paste any Amazon.in product URL to run a live analysis. On the input page, click the **Try Sample Data** button to load a preset analysis of Himalaya shampoo vs 3 competitors for a quick demo without needing to find URLs yourself.

## How it works

1. User pastes their Amazon.in listing URL and up to 9 competitor URLs.
2. Backend extracts ASINs and starts an async analysis job.
3. For each listing: scrapes title, price, rating, review count, and Best Seller Rank via ScraperAPI and Cheerio.
4. Reviews are extracted from the product page HTML using multiple CSS selectors with fallback handling.
5. Estimated monthly sales are computed from BSR using the formula: 1000 divided by BSR to the power of 0.6.
6. Gemini AI analyzes the reviews and returns purchase criteria, complaints, differentiators, and a sentiment score as structured JSON.
7. Results are stored in MongoDB and returned to the frontend via REST API.
8. Frontend polls for job status every 3 seconds and renders the dashboard when complete.

## Tech Stack

**Backend:** Bun, Express, TypeScript, MongoDB, Mongoose, Axios, Cheerio, ScraperAPI, Google Gemini API

**Frontend:** React, TypeScript, Vite, Zustand, Recharts, React Router, Tailwind CSS

## Project Structure

```
pixii-review-analytics/
  backend/
    src/
      controllers/
      models/
      routes/
      services/
      db.ts
      index.ts
  frontend/
    src/
      api/
      components/
      pages/
      store/
```

## Local Setup

### Prerequisites

- Node.js 18 or higher
- Bun installed globally
- MongoDB Atlas account
- ScraperAPI account (free tier gives 1000 credits per month)
- Google Gemini API key (free tier available)

### Clone and install

```bash
git clone https://github.com/kumarlalit79/pixii-review-analytics-assignment.git
cd pixii-review-analytics

cd backend
bun install

cd ../frontend
npm install
```

### Environment variables

Create a `.env` file inside the `backend` folder with the following:

```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
SCRAPERAPI_KEY=your_scraperapi_key
```

`.env.example`:

```
PORT=5000
MONGODB_URI=
GEMINI_API_KEY=
SCRAPERAPI_KEY=
```

### Run locally

```bash
# terminal 1 - backend
cd backend
bun run src/index.ts

# terminal 2 - frontend
cd frontend
npm run dev
```

Frontend runs on http://localhost:5173 and backend runs on http://localhost:5000.

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/analysis/start | Start a new analysis job |
| GET | /api/analysis/:id/status | Poll job status and progress |
| GET | /api/analysis/:id/results | Fetch completed results |
| GET | /api/analysis/history | List recent analyses |

Sample request body for the start endpoint:

```json
{
  "mainUrl": "https://www.amazon.in/dp/B006G84OIO",
  "competitorUrls": [
    "https://www.amazon.in/dp/B08QN46H4G"
  ]
}
```

## Key Design Decisions

1. ScraperAPI is used as a proxy layer because Amazon blocks direct requests from server IPs.
2. Reviews are scraped from the product page rather than the dedicated reviews page, because the reviews page requires login cookies that ScraperAPI cannot provide without a premium plan.
3. The BSR to monthly sales formula (1000 divided by BSR to the power of 0.6) is a well-known estimation used by tools like Jungle Scout. It is an approximation, not exact data.
4. Gemini analysis falls back to title-based inference when reviews are unavailable, so the tool still returns useful output for new listings with no reviews.
5. The analysis job runs asynchronously after the API responds, and the frontend polls for status. This avoids HTTP timeouts on slow scraping jobs.
6. MongoDB is used instead of PostgreSQL for flexible schema handling of scraped data, which varies in structure across product categories.

## Limitations

- Review scraping is limited to reviews embedded on the product page. Amazon's dedicated reviews page requires authenticated sessions, which are not available without a paid proxy plan.
- The monthly revenue estimate is based on BSR and is not real sales data.
- ScraperAPI free tier provides 1000 credits per month. Amazon product pages cost 10 credits each.
- Gemini free tier has rate limits. Analysis of many listings in quick succession may trigger 503 errors, which the service retries automatically up to 3 times.

## What I would build next

1. An AI-generated competitive summary paragraph at the top of results that tells the seller in plain language where they win and lose versus competitors.
2. Scraping multiple pages of reviews using a premium proxy plan with session support, to get closer to the 1000 plus reviews the assignment specified.
3. A weekly tracking feature that reruns the same analysis on a schedule and shows how sentiment and purchase criteria shift over time.
4. PDF export of the full analysis report for agencies managing multiple Amazon clients.
5. Support for Amazon.com in addition to Amazon.in.

## Built by

**Lalit Kumar**
B.Tech Computer Science (AI/ML), GBPIET

Portfolio: https://lalit-kumar.vercel.app/

GitHub: https://github.com/kumarlalit79/pixii-review-analytics-assignment.git
