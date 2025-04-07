import { Router } from "express";

import { bulkUpload } from "../../../storage/uploadMiddleware";
import StructuralLevelController from "../controllers";

const router = Router();

router.get("/", StructuralLevelController.list);
router.post("/", StructuralLevelController.create);
router.get("/:id", StructuralLevelController.retrieve);
router.put("/:id", StructuralLevelController.update);
router.delete("/:id", StructuralLevelController.destroy);
router.post(
  "/bulk-upload",
  bulkUpload.single("file") as any,
  StructuralLevelController.bulkUpload
);

export default router;
