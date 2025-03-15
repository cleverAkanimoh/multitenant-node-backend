import { Request, Response, NextFunction } from "express";
import cloudinary from "cloudinary";
import { cloudinaryUploader } from "./utils/uploader";
import { customResponse } from "../../utils/customResponse";

cloudinary.v2.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json(customResponse({ message: "No file uploaded", statusCode: 400 }));
    const result = await cloudinaryUploader(req.file.path);
    res.json(
      customResponse({
        statusCode: 200,
        message: "File uploaded successfully",
        data: result.secure_url,
      })
    );
  } catch (error) {
    next(error);
  }
};
