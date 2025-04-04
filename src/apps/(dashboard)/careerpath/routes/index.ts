
import { Router } from "express";

import { bulkUpload } from "../../../storage/uploadMiddleware";
import CareerPathController from "../controllers";

const router = Router();

router.get("/", CareerPathController.list);
router.post("/", CareerPathController.create);
router.get("/:id", CareerPathController.retrieve);
router.put("/:id", CareerPathController.update);
router.delete("/:id", CareerPathController.destroy);
router.post(
  "/bulk-upload",
  bulkUpload.single("file") as any,
  CareerPathController.bulkUpload
);

export default router;

