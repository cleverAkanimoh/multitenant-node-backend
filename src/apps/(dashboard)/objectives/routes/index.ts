
import { Router } from "express";

import { bulkUpload } from "../../../storage/uploadMiddleware";
import ObjectivesController from "../controllers";

const router = Router();

router.get("/", ObjectivesController.list);
router.post("/", ObjectivesController.create);
router.get("/:id", ObjectivesController.retrieve);
router.put("/:id", ObjectivesController.update);
router.delete("/:id", ObjectivesController.destroy);
router.post(
  "/bulk-upload",
  bulkUpload.single("file") as any,
  ObjectivesController.bulkUpload
);

export default router;

