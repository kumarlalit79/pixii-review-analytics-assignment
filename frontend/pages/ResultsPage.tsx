import { useNavigate } from "react-router-dom";
import { useAnalysisStore } from "../store/analysisStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function ResultsPage() {
  const { results, reset } = useAnalysisStore();
  const navigate = useNavigate();

  if (!results) {
    navigate("/");
    return null;
  }

  const { products, insights } = results;

  const mainProduct = products.find((p) => p.isMain);
  const competitors = products.filter((p) => !p.isMain);

  // build criteria frequency chart data
  const criteriaMap: Record<string, number> = {};
  insights.forEach((ins) => {
    ins.purchaseCriteria.forEach((c) => {
      const key = c.toLowerCase();
      criteriaMap[key] = (criteriaMap[key] || 0) + 1;
    });
  });
  const chartData = Object.entries(criteriaMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  const handleReset = () => {
    reset();
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "#fff",
        padding: "32px 24px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1
              style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}
            >
              Analysis Results
            </h1>
            <p style={{ color: "#888", fontSize: "14px" }}>
              {products.length} listing{products.length > 1 ? "s" : ""} analyzed
            </p>
          </div>
          <button onClick={handleReset} style={ghostBtn}>
            ← New Analysis
          </button>
        </div>

        {mainProduct && (
          <Section title="Quick Summary">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {/* Main Product */}
              <div
                style={{
                  background: "#1a1500",
                  padding: "16px",
                  borderRadius: "10px",
                  border: "1px solid #f90",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    color: "#f90",
                    marginBottom: "6px",
                  }}
                >
                  MAIN
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#ccc",
                    marginBottom: "8px",
                  }}
                >
                  {mainProduct.title.slice(0, 60)}...
                </p>
                <p style={{ fontSize: "14px" }}>₹{mainProduct.price}</p>
                <p style={{ fontSize: "12px", color: "#888" }}>
                  {mainProduct.rating}⭐ • {mainProduct.reviewCount} reviews
                </p>
              </div>

              {/* Competitor */}
              {competitors[0] && (
                <div
                  style={{
                    background: "#1a1a1a",
                    padding: "16px",
                    borderRadius: "10px",
                    border: "1px solid #333",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#888",
                      marginBottom: "6px",
                    }}
                  >
                    TOP COMPETITOR
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#ccc",
                      marginBottom: "8px",
                    }}
                  >
                    {competitors[0].title.slice(0, 60)}...
                  </p>
                  <p style={{ fontSize: "14px" }}>₹{competitors[0].price}</p>
                  <p style={{ fontSize: "12px", color: "#888" }}>
                    {competitors[0].rating > 0
                      ? `${competitors[0].rating}⭐`
                      : "No ratings"}
                  </p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Products Table */}
        <Section title="Market Overview">
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #333", color: "#888" }}>
                  <th style={th}>Product</th>
                  <th style={th}>Price</th>
                  <th style={th}>Rating</th>
                  <th style={th}>Reviews</th>
                  <th style={th}>BSR</th>
                  <th style={th}>Est. Monthly Sales</th>
                  <th style={th}>Est. Revenue</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.asin}
                    style={{
                      borderBottom: "1px solid #1e1e1e",
                      background: p.isMain ? "#1a1500" : "transparent",
                    }}
                  >
                    <td style={td}>
                      <span
                        style={{
                          fontSize: "11px",
                          color: p.isMain ? "#f90" : "#888",
                          marginRight: "6px",
                        }}
                      >
                        {p.isMain ? "MAIN" : "COMPETITOR"}
                      </span>
                      <span style={{ color: "#fff" }}>
                        {p.title.slice(0, 50)}...
                      </span>
                    </td>
                    <td style={td}>₹{p.price.toLocaleString()}</td>
                    <td style={td}>{p.rating > 0 ? `${p.rating}⭐` : "—"}</td>
                    <td style={td}>
                      {p.reviewCount > 0 ? p.reviewCount.toLocaleString() : "—"}
                    </td>
                    <td style={td}>
                      {p.bsr > 0 ? `#${p.bsr.toLocaleString()}` : "—"}
                    </td>
                    <td style={td}>{p.estimatedMonthlySales}</td>
                    <td style={td}>
                      ₹{p.estimatedMonthlyRevenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Purchase Criteria Chart */}
        {chartData.length > 0 && (
          <Section title="Top Purchase Criteria Across All Listings">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={200}
                  tick={{ fill: "#ccc", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#f90" : "#444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Section>
        )}

        {/* Per listing insight cards */}
        <Section title="Listing Insights">
          <div style={{ display: "grid", gap: "16px" }}>
            {insights.map((ins) => {
              const product = products.find((p) => p.asin === ins.asin);
              return (
                <div
                  key={ins.asin}
                  style={{
                    background: "#1a1a1a",
                    borderRadius: "12px",
                    padding: "20px",
                    border: product?.isMain
                      ? "1px solid #f90"
                      : "1px solid #2a2a2a",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "11px",
                          color: product?.isMain ? "#f90" : "#888",
                          fontWeight: 600,
                        }}
                      >
                        {product?.isMain ? "MAIN LISTING" : "COMPETITOR"}
                      </span>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#ccc",
                          marginTop: "4px",
                        }}
                      >
                        {product?.title.slice(0, 60)}...
                      </p>
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        flexShrink: 0,
                        marginLeft: "16px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: 700,
                          color: sentimentColor(ins.sentimentScore),
                        }}
                      >
                        {ins.sentimentScore > 0 ? ins.sentimentScore : "—"}
                      </div>
                      <div style={{ fontSize: "11px", color: "#888" }}>
                        sentiment / 5
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <InsightBlock
                      title="Why Customers Buy"
                      items={ins.purchaseCriteria}
                      color="#4ade80"
                    />
                    <InsightBlock
                      title="Complaints"
                      items={ins.complaints}
                      color="#f87171"
                    />
                    <InsightBlock
                      title="Differentiators"
                      items={ins.differentiators}
                      color="#60a5fa"
                    />
                  </div>

                  {ins.reviewsSample && ins.reviewsSample.length > 0 && (
                    <div
                      style={{
                        marginTop: "16px",
                        borderTop: "1px solid #2a2a2a",
                        paddingTop: "12px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#888",
                          marginBottom: "8px",
                        }}
                      >
                        SAMPLE REVIEWS
                      </p>
                      {ins.reviewsSample.slice(0, 2).map((r, i) => (
                        <p
                          key={i}
                          style={{
                            fontSize: "13px",
                            color: "#aaa",
                            fontStyle: "italic",
                            marginBottom: "4px",
                          }}
                        >
                          "{r.slice(0, 120)}..."
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h2
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: "#ccc",
          marginBottom: "16px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function InsightBlock({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: string;
}) {
  return (
    <div>
      <p
        style={{
          fontSize: "11px",
          color,
          fontWeight: 600,
          marginBottom: "8px",
        }}
      >
        {title}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items
          .filter((i) => !i.toLowerCase().includes("none"))
          .map((item, i) => (
            <li
              key={i}
              style={{
                fontSize: "12px",
                color: "#ccc",
                marginBottom: "6px",
                paddingLeft: "8px",
                borderLeft: `2px solid ${color}`,
              }}
            >
              {item}
            </li>
          ))}
      </ul>
    </div>
  );
}

function sentimentColor(score: number): string {
  if (score === 0) return "#555";
  if (score >= 4) return "#4ade80";
  if (score >= 3) return "#facc15";
  return "#f87171";
}

const ghostBtn: React.CSSProperties = {
  padding: "8px 16px",
  background: "transparent",
  border: "1px solid #444",
  borderRadius: "6px",
  color: "#ccc",
  cursor: "pointer",
  fontSize: "14px",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontWeight: 500,
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  color: "#ccc",
  verticalAlign: "top",
};
