import { Router } from "express";
import { SpecialtyRoutes } from "../modules/specialty/specialty.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UserRoutes } from "../modules/user/user.route";
import { DoctorRoutes } from "../modules/doctor/doctor.routes";
import { AdminRoutes } from "../modules/admin/admin.routes";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/specialties", SpecialtyRoutes);
router.use("/doctors", UserRoutes);
router.use("/doctors", DoctorRoutes);
router.use("/admins", AdminRoutes);

export const IndexRoutes = router;
