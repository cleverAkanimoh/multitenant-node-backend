import { Router } from "express";

import PerspectiveController from "../controllers";

const router = Router();

router.get("/", PerspectiveController.list);
router.post("/", PerspectiveController.create);
router.get("/:id", PerspectiveController.retrieve);
router.put("/:id", PerspectiveController.update);
router.delete("/:id", PerspectiveController.destroy);
router.post("/bulk-upload", PerspectiveController.bulkUpload);

export default router;
