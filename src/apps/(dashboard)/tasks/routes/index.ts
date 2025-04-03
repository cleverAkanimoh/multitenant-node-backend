
import { Router } from "express";

import { bulkUpload } from "../../../storage/uploadMiddleware";
import TasksController from "../controllers";

const router = Router();

router.get("/", TasksController.list);
router.post("/", TasksController.create);
router.get("/:id", TasksController.retrieve);
router.put("/:id", TasksController.update);
router.delete("/:id", TasksController.destroy);
router.post(
  "/bulk-upload",
  bulkUpload.single("file") as any,
  TasksController.bulkUpload
);

export default router;

