import { Router } from "express";
import { authenticate } from "passport";
import tenantMiddleware from "../../../middlewares/tenantMiddleware";
import CompanyController from "../controllers";

const router = Router();

router.get("/current", authenticate as any, CompanyController.current);

router.get("/", CompanyController.list);
router.post("/", CompanyController.create);
router.get("/:id", CompanyController.retrieve);
router.put("/:id", CompanyController.update);
router.delete("/:id", CompanyController.destroy);

export default router;
