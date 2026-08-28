import { Router } from "express";
import { SpecialtyRoutes } from "../modules/specialty/specialty.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/specialties", SpecialtyRoutes);

export const IndexRoutes = router;
