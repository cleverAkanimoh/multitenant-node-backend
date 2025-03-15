import { Router } from "express";
import { uploadFile } from "./controllers";
import uploadMiddleware from "./uploadMiddleware";

const router = Router();

router.post("/upload", uploadMiddleware.single("file") as any, uploadFile);

export default router;
