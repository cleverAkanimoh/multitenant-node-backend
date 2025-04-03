
import { Router } from "express";

import { bulkUpload } from "../../../storage/uploadMiddleware";
import DesignationsController from "../controllers";

const router = Router();

router.get("/", DesignationsController.list);
router.post("/", DesignationsController.create);
router.get("/:id", DesignationsController.retrieve);
router.put("/:id", DesignationsController.update);
router.delete("/:id", DesignationsController.destroy);
router.post(
  "/bulk-upload",
  bulkUpload.single("file") as any,
  DesignationsController.bulkUpload
);

export default router;

