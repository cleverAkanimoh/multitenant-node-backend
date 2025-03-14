import { Router } from "express";
import * as userController from "./controllers/userControllers";
import * as designerController from "./controllers/designerControllers";
import * as multiFAController from "./controllers/multiFA";
import * as socialController from "./controllers/socialControllers";
import { authenticate } from "./middlewares";
import tenantMiddleware from "../../middlewares/tenantMiddleware";

const router = Router();

router.post("/register-company", designerController.registerDesigner);
router.post("/login-company", designerController.loginDesigner);
router.get("/current-company", designerController.getCurrentDesigner);

router.post("/register", tenantMiddleware, userController.registerUser);
router.post("/login", tenantMiddleware, userController.login);
router.get("/current-user", tenantMiddleware, userController.getCurrentUser);

router.post("/verify-account", userController.activateAccount);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetUserPassword);
router.post(
  "/change-password",
  authenticate as any,
  userController.changePassword as any
);

router.post("/enable-mfa", multiFAController.enableMfa as any);
router.post("/verify-mfa", multiFAController.verifyMfa as any);

router.get("/google", socialController.googleAuth);
router.get("/google/callback", socialController.googleAuthCallback);
router.get("/facebook", socialController.facebookAuth);
router.get("/facebook/callback", socialController.facebookAuthCallback);
router.get("/instagram", socialController.instagramAuth);
router.get("/instagram/callback", socialController.instagramAuthCallback);

export default router;
