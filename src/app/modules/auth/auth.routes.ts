import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
const router = Router();

router.post("/register", AuthController.registerPatient);
router.post("/signIn", AuthController.signInUser);
router.get(
  "/me",
  checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  AuthController.getMe,
);

router.post(
  "/change-password",
  checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  AuthController.changePassword,
);
router.post(
  "/logout",
  checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN),
);

router.post("/refresh-token", AuthController.getNewToken);
export const AuthRoutes = router;
