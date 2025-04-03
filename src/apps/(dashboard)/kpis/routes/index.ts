import { Router } from "express";

import { bulkUpload } from "../../../storage/uploadMiddleware";
import KPIController from "../controllers";

const router = Router();

router.get("/", KPIController.list);
router.post("/", KPIController.create);
router.get("/:id", KPIController.retrieve);
router.put("/:id", KPIController.update);
router.delete("/:id", KPIController.destroy);
router.post(
  "/bulk-upload",
  bulkUpload.single("file") as any,
  KPIController.bulkUpload
);

export default router;
