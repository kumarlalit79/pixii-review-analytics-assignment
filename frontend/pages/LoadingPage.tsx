import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysisStore } from "../store/analysisStore";
import { getStatus, getResults } from "../api/analysis.api";
import Navbar from "../components/Navbar";

export default function LoadingPage() {
  const { analysisId, status, progress, totalListings, setStatus, setResults } =
    useAnalysisStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!analysisId) {
      navigate("/");
      return;
    }

    const poll = setInterval(async () => {
      try {
        const s = await getStatus(analysisId);
        setStatus(s.status, s.progress);

        if (s.status === "complete") {
          clearInterval(poll);
          const results = await getResults(analysisId);
          setResults(results);
          navigate("/results");
        }

        if (s.status === "failed") {
          clearInterval(poll);
          navigate("/");
        }
      } catch {
        clearInterval(poll);
      }
    }, 3000);

    return () => clearInterval(poll);
  }, [analysisId]);

  const percent =
    totalListings > 0 ? Math.round((progress / totalListings) * 100) : 0;

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: "100vh", background: "#FBF9F7" }}
    >
      <Navbar />

      <div
        className="flex flex-1 items-center justify-center pixii-fade-in"
        style={{ padding: "24px" }}
      >
        <div
          className="text-center"
          style={{ maxWidth: "400px", width: "100%", padding: "24px" }}
        >
          {/* Spinner */}
          <div
            className="flex justify-center"
            style={{ marginBottom: "32px" }}
          >
            <div className="pixii-spinner" />
          </div>

          {/* Heading */}
          <h2
            style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "24px",
              color: "#151414",
              marginBottom: "10px",
            }}
          >
            Analyzing your listings
          </h2>

          {/* Subtext */}
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "15px",
              color: "#6b6b6b",
              marginBottom: "36px",
              lineHeight: "1.5",
            }}
          >
            Scraping reviews and running AI analysis. This takes 30–90 seconds depending on number of listings.
          </p>

          {/* Progress bar */}
          <div
            style={{
              width: "100%",
              height: "6px",
              background: "#e8e4e0",
              borderRadius: "99px",
              overflow: "hidden",
              marginBottom: "14px",
            }}
          >
            <div
              className="pixii-shimmer"
              style={{
                height: "100%",
                width: `${percent}%`,
                background: "#CE4522",
                borderRadius: "99px",
                transition: "width 0.5s ease",
              }}
            />
          </div>

          {/* Progress text */}
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              color: "#6b6b6b",
            }}
          >
            {progress} of {totalListings} listings processed
          </p>

          {/* Status */}
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              color: "#6b6b6b",
              marginTop: "6px",
              textTransform: "capitalize",
            }}
          >
            Status: {status}
          </p>
        </div>
      </div>
    </div>
  );
}
