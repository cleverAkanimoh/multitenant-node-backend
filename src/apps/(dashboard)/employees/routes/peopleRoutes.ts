import { Router } from "express";
import PeopleController from "../controllers";

const router = Router();

router.get("/dashboard/employees", PeopleController.list);
router.post("/dashboard/employees", PeopleController.create);
router.get("/dashboard/employees/:id", PeopleController.retrieve);
router.put("/dashboard/employees/:id", PeopleController.update);
router.delete("/dashboard/employees/:id", PeopleController.destroy);
router.post("/dashboard/people/bulk-upload", PeopleController.bulkUpload);

export default router;
