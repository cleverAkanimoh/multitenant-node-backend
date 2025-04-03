
import { Router } from "express";

import { bulkUpload } from "../../../storage/uploadMiddleware";
import PeopleController from "../controllers";

const router = Router();

router.get("/", PeopleController.list);
router.post("/", PeopleController.create);
router.get("/:id", PeopleController.retrieve);
router.put("/:id", PeopleController.update);
router.delete("/:id", PeopleController.destroy);
router.post(
  "/bulk-upload",
  bulkUpload.single("file") as any,
  PeopleController.bulkUpload
);

export default router;

