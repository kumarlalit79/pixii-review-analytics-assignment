import { Router } from "express";
import {
  startAnalysis,
  getStatus,
  getResults,
  getHistory,
} from "../controllers/analysis.controller";

const router = Router();

router.post("/start", startAnalysis);
router.get("/history", getHistory);
router.get("/:id/status", getStatus);
router.get("/:id/results", getResults);

export default router;