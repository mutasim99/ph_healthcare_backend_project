import { Router } from "express";
import { specialtyRoutes } from "../modules/specialty/specialty.routes";

const router = Router();

router.use(specialtyRoutes);

export const indexRoutes = router;
