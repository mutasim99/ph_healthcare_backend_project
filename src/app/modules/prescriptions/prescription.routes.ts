import express from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { prescriptionController } from "./prescription.controller";
import { PrescriptionValidation } from "./prescription.validation";

const router = express.Router();

router.get(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  prescriptionController.getAllPrescriptions,
);

router.get(
  "/my-prescriptions",
  checkAuth(Role.PATIENT, Role.DOCTOR),
  prescriptionController.myPrescription,
);

router.post(
  "/",
  checkAuth(Role.DOCTOR),
  validateRequest(PrescriptionValidation.createPrescriptionZodSchema),
  prescriptionController.givePrescription,
);

router.patch(
  "/:id",
  checkAuth(Role.DOCTOR),
  validateRequest(PrescriptionValidation.updatePrescriptionZodSchema),
  prescriptionController.updatePrescription,
);

router.delete(
  "/:id",
  checkAuth(Role.DOCTOR),
  prescriptionController.deletePrescription,
);

export const PrescriptionRoutes = router;
