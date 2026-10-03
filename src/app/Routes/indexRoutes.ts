import { Router } from "express";
import { SpecialtyRoutes } from "../modules/specialty/specialty.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UserRoutes } from "../modules/user/user.route";
import { DoctorRoutes } from "../modules/doctor/doctor.routes";
import { AdminRoutes } from "../modules/admin/admin.routes";
import { ScheduleRoutes } from "../modules/schedule/schedule.routes";
import { DoctorScheduleRoutes } from "../modules/doctorSchedules/doctorSchedules.routes";
import { AppointmentRoutes } from "../modules/appointments/appointments.routes";
import { patientRoutes } from "../modules/patient/patient.routes";
import { ReviewRoutes } from "../modules/reviews/review.routes";
import { PrescriptionRoutes } from "../modules/prescriptions/prescription.routes";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/specialties", SpecialtyRoutes);
router.use("/doctors", UserRoutes);
router.use("/doctors", DoctorRoutes);
router.use("/admins", AdminRoutes);
router.use("/schedules", ScheduleRoutes);
router.use("/doctor-schedules", DoctorScheduleRoutes);
router.use("/appointments", AppointmentRoutes);
router.use("patients", patientRoutes);
router.use("/review", ReviewRoutes);
router.use("/prescriptions", PrescriptionRoutes);

export const IndexRoutes = router;
