import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startAnalysis } from "../api/analysis.api";
import { useAnalysisStore } from "../store/analysisStore";

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
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "640px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>
          Amazon Review Analytics
        </h1>
        <p style={{ color: "#888", marginBottom: "32px" }}>
          Paste Amazon.in listing URLs to extract customer insights and compare competitors.
        </p>

        <label style={{ display: "block", marginBottom: "8px", color: "#ccc", fontSize: "14px" }}>
          Main Listing URL
        </label>
        <input
          value={mainUrl}
          onChange={(e) => setMainUrl(e.target.value)}
          placeholder="https://www.amazon.in/dp/XXXXXXXXXX"
          style={inputStyle}
        />

        <div style={{ marginTop: "24px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ color: "#ccc", fontSize: "14px" }}>Competitor URLs (optional, up to 9)</label>
          <button onClick={addCompetitor} style={ghostBtn}>+ Add</button>
        </div>

        {competitorUrls.map((url, i) => (
          <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <input
              value={url}
              onChange={(e) => updateCompetitor(i, e.target.value)}
              placeholder={`Competitor ${i + 1} URL`}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={() => removeCompetitor(i)} style={ghostBtn}>✕</button>
          </div>
        ))}

        {error && <p style={{ color: "#ff6b6b", marginTop: "12px", fontSize: "14px" }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: "24px", width: "100%", padding: "14px", background: loading ? "#333" : "#f90", border: "none", borderRadius: "8px", color: "#000", fontWeight: 700, fontSize: "16px", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Starting..." : "Analyze Listings →"}
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  background: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "14px",
  boxSizing: "border-box",
};

const ghostBtn: React.CSSProperties = {
  padding: "8px 12px",
  background: "transparent",
  border: "1px solid #444",
  borderRadius: "6px",
  color: "#ccc",
  cursor: "pointer",
};