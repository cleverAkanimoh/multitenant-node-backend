import fs from "fs";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = `uploads/`;

    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);

    //  fs.unlink(uploadPath, (err) => {
    //    if (err) {
    //      console.error(`Failed to delete file: ${uploadPath}`, err);
    //    }
    //  });
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.company}-${Date.now()}${ext}`);
  },
});

const uploadMiddleware = multer({ storage });


export const bulkUpload = multer({ storage: multer.memoryStorage() });

export default uploadMiddleware;
