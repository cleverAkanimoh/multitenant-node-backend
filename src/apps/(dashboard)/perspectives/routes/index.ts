import { Router } from "express";

import { bulkUpload } from "../../../storage/uploadMiddleware";
import PerspectiveController from "../controllers";

const router = Router();

router.get("/", PerspectiveController.list);
router.post("/", PerspectiveController.create);
router.get("/:id", PerspectiveController.retrieve);
router.put("/:id", PerspectiveController.update);
router.delete("/:id", PerspectiveController.destroy);
router.post(
  "/bulk-upload",
  bulkUpload.single("file") as any,
  PerspectiveController.bulkUpload
);

export default router;
