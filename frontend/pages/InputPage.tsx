import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startAnalysis } from "../api/analysis.api";
import { useAnalysisStore } from "../store/analysisStore";
import Navbar from "../components/Navbar";

export default function InputPage() {
  const [mainUrl, setMainUrl] = useState("");
  const [competitorUrls, setCompetitorUrls] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAnalysisStarted } = useAnalysisStore();
  const navigate = useNavigate();

  const addCompetitor = () => {
    if (competitorUrls.length < 9)
      setCompetitorUrls([...competitorUrls, ""]);
  };

  const updateCompetitor = (index: number, value: string) => {
    const updated = [...competitorUrls];
    updated[index] = value;
    setCompetitorUrls(updated);
  };

  const removeCompetitor = (index: number) => {
    setCompetitorUrls(competitorUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!mainUrl.trim()) {
      setError("Please enter a main listing URL");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const validCompetitors = competitorUrls.filter((u) => u.trim());
      const data = await startAnalysis(mainUrl.trim(), validCompetitors);
      if (data.analysisId) {
        setAnalysisStarted(data.analysisId, data.totalListings);
        navigate("/loading");
      } else {
        setError("Failed to start analysis. Check your URLs.");
      }
    } catch {
      setError("Server error. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

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
        <div style={{ width: "100%", maxWidth: "600px" }}>
          {/* Hero area */}
          <div className="text-center" style={{ marginBottom: "40px" }}>
            {/* Pill tag */}
            <span
              style={{
                display: "inline-block",
                background: "#CE4522",
                color: "#fff",
                fontFamily: "'Switzer', sans-serif",
                fontWeight: 600,
                fontSize: "12px",
                padding: "5px 14px",
                borderRadius: "99px",
                marginBottom: "20px",
                letterSpacing: "0.02em",
              }}
            >
              Powered by Gemini AI
            </span>

            <h1
              style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "40px",
                color: "#151414",
                lineHeight: "1.1",
                marginBottom: "14px",
              }}
            >
              Amazon Listing Intelligence
            </h1>

            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "16px",
                color: "#6b6b6b",
                maxWidth: "480px",
                margin: "0 auto",
                lineHeight: "1.6",
              }}
            >
              Paste up to 10 Amazon.in URLs to extract customer insights,
              purchase drivers, and competitive intelligence.
            </p>
          </div>

          {/* Main URL input */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontFamily: "'Switzer', sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                color: "#151414",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "8px",
              }}
            >
              Your Main Listing
            </label>
            <input
              value={mainUrl}
              onChange={(e) => setMainUrl(e.target.value)}
              placeholder="https://www.amazon.in/dp/XXXXXXXXXX"
              className="pixii-input"
              style={{
                width: "100%",
                background: "#FFFFFF",
                border: "1.5px solid #e8e4e0",
                borderRadius: "10px",
                padding: "14px 16px",
                fontSize: "15px",
                fontFamily: "'DM Sans', sans-serif",
                color: "#151414",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Competitor section */}
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: "12px" }}
          >
            <label
              style={{
                fontFamily: "'Switzer', sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                color: "#151414",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Competitor Listings
            </label>
            <button
              onClick={addCompetitor}
              className="pixii-btn"
              style={{
                background: "transparent",
                border: "none",
                color: "#CE4522",
                fontFamily: "'Switzer', sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              + Add Competitor
            </button>
          </div>

          {competitorUrls.map((url, i) => (
            <div
              key={i}
              className="flex items-center"
              style={{ gap: "8px", marginBottom: "10px" }}
            >
              <input
                value={url}
                onChange={(e) => updateCompetitor(i, e.target.value)}
                placeholder={`Competitor ${i + 1} URL`}
                className="pixii-input"
                style={{
                  flex: 1,
                  background: "#FFFFFF",
                  border: "1.5px solid #e8e4e0",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  fontSize: "15px",
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#151414",
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={() => removeCompetitor(i)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#999",
                  cursor: "pointer",
                  fontSize: "18px",
                  padding: "8px",
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
          ))}

          {/* Error */}
          {error && (
            <p
              style={{
                color: "#CE4522",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                marginTop: "12px",
              }}
            >
              {error}
            </p>
          )}

          {/* CTA */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="pixii-btn"
            style={{
              marginTop: "24px",
              width: "100%",
              padding: "15px",
              background: loading ? "#CE4522" : "#CE4522",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontFamily: "'Switzer', sans-serif",
              fontWeight: 700,
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? "Starting..." : "Analyze Listings →"}
          </button>
        </div>
      </div>
    </div>
  );
}