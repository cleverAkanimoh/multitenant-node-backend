import { Router } from "express";

import CompanyController from "../controllers";

const router = Router();

router.get("/current", CompanyController.current);

// router.get("/", CompanyController.list);
// router.post("/", CompanyController.create);
// router.get("/:id", CompanyController.retrieve);
router.put("/:id", CompanyController.update);
router.delete("/:id", CompanyController.destroy);

export default router;
