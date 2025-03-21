import { Router } from "express";
import * as userController from "./controllers/userControllers";

import tenantMiddleware from "../../middlewares/tenantMiddleware";
import * as multiFAController from "./controllers/multiFA";
import { authenticate } from "./middlewares";

const router = Router();

router.post("/register", tenantMiddleware, userController.registerUser);
router.post("/login", tenantMiddleware, userController.login);
router.get("/current-user", tenantMiddleware, userController.getCurrentUser);

router.post("/verify-account", userController.activateAccount);
// router.post("/forgot-password", userController.forgotPassword);
// router.post("/reset-password", userController.resetUserPassword);
router.post(
  "/change-password",
  authenticate as any,
  userController.changePassword as any
);

router.post("/enable-mfa", multiFAController.enableMfa as any);
router.post("/verify-mfa", multiFAController.verifyMfa as any);

export default router;
