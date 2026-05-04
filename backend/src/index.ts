import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db";
import dns from "dns"
import analysisRoutes from "./routes/analysis.routes";

dotenv.config();

dns.setServers(["1.1.1.1", "8.8.8.8"])

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/analysis", analysisRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;