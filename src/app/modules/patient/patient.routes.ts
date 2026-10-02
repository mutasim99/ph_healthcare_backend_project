import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { updateMyPatientProfileMiddleware } from "./patient.middleware";
import { validateRequest } from "../../middleware/validateRequest";
import { patientValidation } from "./patient.validation";
import { patientController } from "./patient.controller";

const router = Router();

router.patch(
  "/update-my-profile",
  checkAuth(Role.PATIENT),
  multerUpload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "medicalReports", maxCount: 5 },
  ]),
  updateMyPatientProfileMiddleware,
  validateRequest(patientValidation.updatePatientProfileZodSchema),
  patientController.updateMyProfile,
);

export const patientRoutes = router;
