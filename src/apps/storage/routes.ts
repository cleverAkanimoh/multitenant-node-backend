import express from "express";
import { upload } from "./uploadMiddleware";

import * as controller from "./controllers"

const router = express.Router();

router.post("/upload", upload.single("file"), controller.uploadFiles);

router.get("/file/:filename", controller.retrieveFile);

router.delete("/delete/:filename", controller.deleteFile);

export default router;
