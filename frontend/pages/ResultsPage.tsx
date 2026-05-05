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
import Navbar from "../components/Navbar";

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
      className="flex flex-col"
      style={{ minHeight: "100vh", background: "#FBF9F7" }}
    >
      <Navbar />

      <div className="pixii-fade-in" style={{ padding: "32px 24px" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          {/* Header */}
          <div
            className="flex justify-between items-center"
            style={{ marginBottom: "36px" }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "28px",
                  color: "#151414",
                  marginBottom: "4px",
                }}
              >
                Analysis Results
              </h1>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#6b6b6b",
                  fontSize: "14px",
                }}
              >
                {products.length} listing{products.length > 1 ? "s" : ""}{" "}
                analyzed
              </p>
            </div>
            <button
              onClick={handleReset}
              className="pixii-btn"
              style={{
                background: "transparent",
                border: "none",
                color: "#CE4522",
                fontFamily: "'Switzer', sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                padding: "8px 0",
              }}
            >
              ← New Analysis
            </button>
          </div>

          {/* QUICK SUMMARY */}
          {mainProduct && (
            <Section title="Overview">
              <div className="flex" style={{ gap: "16px", flexWrap: "wrap" }}>
                {/* Main Product Card */}
                <div
                  className="pixii-card"
                  style={{
                    flex: "1 1 280px",
                    padding: "20px",
                    borderLeft: "3px solid #CE4522",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Switzer', sans-serif",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#CE4522",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    MAIN
                  </span>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "14px",
                      color: "#151414",
                      marginTop: "8px",
                      marginBottom: "10px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: "1.4",
                    }}
                  >
                    {mainProduct.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Cabinet Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "22px",
                      color: "#151414",
                      marginBottom: "4px",
                    }}
                  >
                    ₹{mainProduct.price}
                  </p>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px",
                      color: "#6b6b6b",
                    }}
                  >
                    {mainProduct.rating}⭐ • {mainProduct.reviewCount} reviews
                  </p>
                </div>

                {/* Competitor Cards */}
                {competitors.map((comp, idx) => (
                  <div
                    key={comp.asin || idx}
                    className="pixii-card"
                    style={{
                      flex: "1 1 280px",
                      padding: "20px",
                      border: "1px solid #e8e4e0",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Switzer', sans-serif",
                        fontSize: "10px",
                        fontWeight: 600,
                        color: "#999",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      COMPETITOR
                    </span>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "14px",
                        color: "#151414",
                        marginTop: "8px",
                        marginBottom: "10px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: "1.4",
                      }}
                    >
                      {comp.title}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Cabinet Grotesk', sans-serif",
                        fontWeight: 700,
                        fontSize: "22px",
                        color: "#151414",
                        marginBottom: "4px",
                      }}
                    >
                      ₹{comp.price}
                    </p>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "13px",
                        color: "#6b6b6b",
                      }}
                    >
                      {comp.rating > 0 ? `${comp.rating}⭐` : "No ratings"} •{" "}
                      {comp.reviewCount > 0
                        ? `${comp.reviewCount} reviews`
                        : "—"}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* MARKET OVERVIEW TABLE */}
          <Section title="Market Overview">
            <div
              className="pixii-card"
              style={{ overflow: "hidden", border: "1px solid #e8e4e0" }}
            >
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f5f3f0" }}>
                      <th style={thStyle}>Product</th>
                      <th style={thStyle}>Price</th>
                      <th style={thStyle}>Rating</th>
                      <th style={thStyle}>Reviews</th>
                      <th style={thStyle}>BSR</th>
                      <th style={thStyle}>Est. Monthly Sales</th>
                      <th style={thStyle}>Est. Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr
                        key={p.asin}
                        style={{
                          borderBottom: "1px solid #e8e4e0",
                          background: p.isMain
                            ? "rgba(206,69,34,0.04)"
                            : "transparent",
                          borderLeft: p.isMain
                            ? "3px solid #CE4522"
                            : "3px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!p.isMain)
                            e.currentTarget.style.background = "#faf8f6";
                        }}
                        onMouseLeave={(e) => {
                          if (!p.isMain)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <td style={tdStyle}>
                          <span
                            style={{
                              fontFamily: "'Switzer', sans-serif",
                              fontSize: "10px",
                              fontWeight: 600,
                              color: p.isMain ? "#CE4522" : "#999",
                              marginRight: "8px",
                              textTransform: "uppercase",
                            }}
                          >
                            {p.isMain ? "MAIN" : "COMP"}
                          </span>
                          <span style={{ color: "#151414" }}>
                            {p.title.slice(0, 50)}...
                          </span>
                        </td>
                        <td style={tdStyle}>₹{p.price.toLocaleString()}</td>
                        <td style={tdStyle}>
                          {p.rating > 0 ? `${p.rating}⭐` : "—"}
                        </td>
                        <td style={tdStyle}>
                          {p.reviewCount > 0
                            ? p.reviewCount.toLocaleString()
                            : "—"}
                        </td>
                        <td style={tdStyle}>
                          {p.bsr > 0 ? `#${p.bsr.toLocaleString()}` : "—"}
                        </td>
                        <td style={tdStyle}>{p.estimatedMonthlySales}</td>
                        <td
                          style={{
                            ...tdStyle,
                            fontFamily: "'Cabinet Grotesk', sans-serif",
                            fontWeight: 700,
                            color: "#151414",
                          }}
                        >
                          ₹{p.estimatedMonthlyRevenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>

          {/* PURCHASE CRITERIA CHART */}
          {chartData.length > 0 && (
            <Section title="Top Purchase Criteria Across All Listings">
              <div
                className="pixii-card"
                style={{ padding: "24px", border: "1px solid #e8e4e0" }}
              >
                <h3
                  style={{
                    fontFamily: "'Cabinet Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: "18px",
                    color: "#151414",
                    marginBottom: "20px",
                  }}
                >
                  Purchase Drivers
                </h3>
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
                      tick={{
                        fill: "#6b6b6b",
                        fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#FFFFFF",
                        border: "1px solid #e8e4e0",
                        borderRadius: "8px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "13px",
                        boxShadow:
                          "0 4px 12px rgba(0,0,0,0.06)",
                      }}
                      labelStyle={{ color: "#151414" }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? "#CE4522" : "#e8e4e0"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Section>
          )}

          {/* LISTING INSIGHT CARDS */}
          <Section title="Listing Insights">
            <div style={{ display: "grid", gap: "20px" }}>
              {insights.map((ins, insIndex) => {
                const product = products.find((p) => p.asin === ins.asin);
                return (
                  <div
                    key={ins.asin}
                    className={`pixii-card pixii-stagger-${insIndex}`}
                    style={{
                      padding: "24px",
                      border: "1px solid #e8e4e0",
                      borderTop: product?.isMain
                        ? "3px solid #CE4522"
                        : "1px solid #e8e4e0",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(206,69,34,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e8e4e0";
                      if (product?.isMain) {
                        e.currentTarget.style.borderTopColor = "#CE4522";
                      }
                    }}
                  >
                    {/* Header: tag + title + sentiment */}
                    <div
                      className="flex justify-between items-start"
                      style={{ marginBottom: "20px" }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            fontFamily: "'Switzer', sans-serif",
                            fontSize: "10px",
                            fontWeight: 600,
                            color: product?.isMain ? "#CE4522" : "#999",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {product?.isMain ? "MAIN LISTING" : "COMPETITOR"}
                        </span>
                        <p
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "15px",
                            color: "#151414",
                            marginTop: "6px",
                            lineHeight: "1.4",
                          }}
                        >
                          {product?.title.slice(0, 80)}
                          {(product?.title.length ?? 0) > 80 ? "..." : ""}
                        </p>
                      </div>
                      <div
                        style={{
                          textAlign: "right",
                          flexShrink: 0,
                          marginLeft: "20px",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Cabinet Grotesk', sans-serif",
                            fontSize: "32px",
                            fontWeight: 700,
                            color: sentimentColor(ins.sentimentScore),
                            lineHeight: 1,
                          }}
                        >
                          {ins.sentimentScore > 0 ? ins.sentimentScore : "—"}
                        </div>
                        <div
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "12px",
                            color: "#999",
                            marginTop: "4px",
                          }}
                        >
                          Sentiment Score
                        </div>
                      </div>
                    </div>

                    {/* Three columns */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "16px",
                      }}
                    >
                      <InsightBlock
                        title="Why Customers Buy"
                        items={ins.purchaseCriteria}
                        titleColor="#CE4522"
                        borderColor="#CE4522"
                      />
                      <InsightBlock
                        title="Complaints"
                        items={ins.complaints}
                        titleColor="#dc2626"
                        borderColor="#dc2626"
                      />
                      <InsightBlock
                        title="Differentiators"
                        items={ins.differentiators}
                        titleColor="#2563eb"
                        borderColor="#2563eb"
                      />
                    </div>

                    {/* Sample reviews */}
                    {ins.reviewsSample && ins.reviewsSample.length > 0 && (
                      <div
                        style={{
                          marginTop: "20px",
                          borderTop: "1px solid #f0ece8",
                          paddingTop: "16px",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "'Switzer', sans-serif",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#999",
                            marginBottom: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Sample Reviews
                        </p>
                        {ins.reviewsSample.slice(0, 2).map((r, i) => (
                          <p
                            key={i}
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "13px",
                              color: "#6b6b6b",
                              fontStyle: "italic",
                              marginBottom: "6px",
                              lineHeight: "1.5",
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
    </div>
  );
}

/* ===== Sub-components ===== */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "36px" }}>
      <h2
        style={{
          fontFamily: "'Switzer', sans-serif",
          fontWeight: 600,
          fontSize: "11px",
          color: "#999",
          marginBottom: "16px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
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
  titleColor,
  borderColor,
}: {
  title: string;
  items: string[];
  titleColor: string;
  borderColor: string;
}) {
  return (
    <div>
      <p
        style={{
          fontFamily: "'Switzer', sans-serif",
          fontSize: "12px",
          fontWeight: 600,
          color: titleColor,
          marginBottom: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
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
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                color: "#4b4b4b",
                padding: "6px 8px",
                borderLeft: `2px solid ${borderColor}`,
                marginBottom: "4px",
                borderRadius: "0 4px 4px 0",
                transition: "background 0.15s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f9f9f9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
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
  if (score === 0) return "#999";
  if (score >= 4) return "#16a34a";
  if (score >= 3) return "#d97706";
  return "#dc2626";
}

/* ===== Table Styles ===== */

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
  fontFamily: "'Switzer', sans-serif",
  fontWeight: 600,
  fontSize: "12px",
  color: "#6b6b6b",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  letterSpacing: "0.03em",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  color: "#151414",
  verticalAlign: "top",
  fontSize: "14px",
};
