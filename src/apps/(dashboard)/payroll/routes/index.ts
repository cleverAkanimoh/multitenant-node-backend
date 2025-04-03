
import { Router } from "express";

import { bulkUpload } from "../../../storage/uploadMiddleware";
import PayrollController from "../controllers";

const router = Router();

router.get("/", PayrollController.list);
router.post("/", PayrollController.create);
router.get("/:id", PayrollController.retrieve);
router.put("/:id", PayrollController.update);
router.delete("/:id", PayrollController.destroy);
router.post(
  "/bulk-upload",
  bulkUpload.single("file") as any,
  PayrollController.bulkUpload
);

export default router;

