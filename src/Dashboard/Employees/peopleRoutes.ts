import { Router } from "express";
import People from "./peopleModel";
import {
  getAllPeople,
  createPeople,
  getPeopleById,
  updatePeople,
  deletePeople,
  peopleUpload,
} from "./peopleController";

const router = Router();

router.get("/dashboard/employees", getAllPeople);
router.post("/dashboard/employees", createPeople);
router.get("/dashboard/employees/:id", getPeopleById);
router.put("/dashboard/employees/:id", updatePeople);
router.delete("/dashboard/employees/:id", deletePeople);
router.post("/dashboard/people/bulk-upload", peopleUpload);

export default router;
