
import { Router } from "express";

import { bulkUpload } from "../../../storage/uploadMiddleware";
import DesignationController from "../controllers";

const router = Router();

router.get("/", DesignationController.list);
router.post("/", DesignationController.create);
router.get("/:id", DesignationController.retrieve);
router.put("/:id", DesignationController.update);
router.delete("/:id", DesignationController.destroy);
router.post(
  "/bulk-upload",
  bulkUpload.single("file") as any,
  DesignationController.bulkUpload
);

export default router;

