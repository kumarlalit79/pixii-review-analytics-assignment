import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysisStore } from "../store/analysisStore";
import { getStatus, getResults } from "../api/analysis.api";

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
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
          padding: "24px",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "24px" }}>⚙️</div>
        <h2 style={{ marginBottom: "8px" }}>Analyzing Listings</h2>
        <p style={{ color: "#888", marginBottom: "32px" }}>
          Scraping reviews and running AI analysis...
        </p>

        <div
          style={{
            background: "#1a1a1a",
            borderRadius: "8px",
            height: "8px",
            overflow: "hidden",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${percent}%`,
              background: "#f90",
              transition: "width 0.5s ease",
            }}
          />
        </div>

        <p style={{ color: "#888", fontSize: "14px" }}>
          {progress} of {totalListings} listings processed ({percent}%)
        </p>

        <p style={{ color: "#aaa", fontSize: "14px", marginTop: "8px" }}>
          Status: {status}
        </p>
      </div>
    </div>
  );
}
