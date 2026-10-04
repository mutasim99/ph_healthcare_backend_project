import { Router } from "express";
import { statsController } from "./stats.controller";

const router = Router();

router.get("/dashboard", statsController.getDashboardStatsData);

export const statsRoutes = router;
