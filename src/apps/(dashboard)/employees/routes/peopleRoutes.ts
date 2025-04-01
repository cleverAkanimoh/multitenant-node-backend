import { Router } from "express";
import {
    createPeople,
    deletePeople,
    getAllPeople,
    getPeopleById,
    peopleUpload,
    updatePeople,
} from "../controllers";

const router = Router();

router.get("/dashboard/employees", getAllPeople);
router.post("/dashboard/employees", createPeople);
router.get("/dashboard/employees/:id", getPeopleById);
router.put("/dashboard/employees/:id", updatePeople);
router.delete("/dashboard/employees/:id", deletePeople);
router.post("/dashboard/people/bulk-upload", peopleUpload);

export default router;
