import { Router } from "express";
import * as userController from "./controllers/userControllers";

import * as multiFAController from "./controllers/multiFA";
import { authenticate } from "./middlewares";

const router = Router();

router.post("/register", userController.registerUser);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

router.get("/current-user", authenticate, userController.getCurrentUser);

router.delete("/delete-user", authenticate, userController.deleteUserAccount);
router.post(
  "/deactivate-user",
  authenticate,
  userController.deactivateUserAccount
);

router.post("/verify-account", userController.activateAccount);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.post(
  "/change-password",

  userController.changePassword
);

router.post(
  "/enable-mfa",
  authenticate,

  multiFAController.enableMfa
);
router.post(
  "/verify-mfa",
  authenticate,

  multiFAController.verifyMfa
);

export default router;
