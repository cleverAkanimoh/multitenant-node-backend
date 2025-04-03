
import { Router } from "express";

import { bulkUpload } from "../../../storage/uploadMiddleware";
import TaskController from "../controllers";

const router = Router();

router.get("/", TaskController.list);
router.post("/", TaskController.create);
router.get("/:id", TaskController.retrieve);
router.put("/:id", TaskController.update);
router.delete("/:id", TaskController.destroy);
router.post(
  "/bulk-upload",
  bulkUpload.single("file") as any,
  TaskController.bulkUpload
);

export default router;

