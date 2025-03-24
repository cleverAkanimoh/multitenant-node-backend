import { Router } from "express";
import * as userController from "./controllers/userControllers";

import * as multiFAController from "./controllers/multiFA";
import { authenticate } from "./middlewares";

const router = Router();

router.post("/register", userController.registerUser);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

router.get("/current-user", authenticate as any, userController.getCurrentUser);
router.delete(
  "/delete-user/:id",
  authenticate as any,
  userController.deleteUserAccount
);
router.post(
  "/deactivate-user/:id",
  authenticate as any,
  userController.deactivateUserAccount
);

router.post("/verify-account", userController.activateAccount);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.post(
  "/change-password",
  authenticate as any,
  userController.changePassword as any
);

router.post("/enable-mfa", multiFAController.enableMfa as any);
router.post("/verify-mfa", multiFAController.verifyMfa as any);

export default router;
