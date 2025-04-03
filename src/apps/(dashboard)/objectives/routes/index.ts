import { Router } from "express";

import { bulkUpload } from "../../../storage/uploadMiddleware";
import ObjectiveController from "../controllers";

const router = Router();

router.get("/", ObjectiveController.list);
router.post("/", ObjectiveController.create);
router.get("/:id", ObjectiveController.retrieve);
router.put("/:id", ObjectiveController.update);
router.delete("/:id", ObjectiveController.destroy);
router.post(
  "/bulk-upload",
  bulkUpload.single("file") as any,
  ObjectiveController.bulkUpload
);

export default router;
