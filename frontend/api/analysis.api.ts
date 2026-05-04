const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const startAnalysis = async (mainUrl: string, competitorUrls: string[]) => {
  const res = await fetch(`${BASE}/api/analysis/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mainUrl, competitorUrls }),
  });
  return res.json();
};

export const getStatus = async (id: string) => {
  const res = await fetch(`${BASE}/api/analysis/${id}/status`);
  return res.json();
};

export const getResults = async (id: string) => {
  const res = await fetch(`${BASE}/api/analysis/${id}/results`);
  return res.json();
};

export const getHistory = async () => {
  const res = await fetch(`${BASE}/api/analysis/history`);
  return res.json();
};