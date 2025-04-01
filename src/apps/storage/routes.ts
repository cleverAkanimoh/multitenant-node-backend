import { Router } from "express";
import { deleteFile, uploadFile } from "./controllers";
import uploadMiddleware from "./uploadMiddleware";

const router = Router();

router.post("/upload", uploadMiddleware.single("file") as any, uploadFile);
router.post("/delete", deleteFile);

export default router;