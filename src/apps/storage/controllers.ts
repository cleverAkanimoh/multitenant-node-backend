import cloudinary from "cloudinary";
import { NextFunction, Request, Response } from "express";
import { customResponse } from "../../utils/customResponse";
import { handleRequests } from "../../utils/handleRequests";
import { cloudinaryDelete, cloudinaryUploader } from "./utils/uploader";

cloudinary.v2.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return res
      .status(400)
      .json(customResponse({ message: "No file uploaded", statusCode: 400 }));
  }

  await handleRequests({
    promise: cloudinaryUploader(req.file.path),
    message: "File uploaded successfully",
    res,
    resData: (data) => data.secure_url,
  });
};

export const deleteFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { public_id } = req.body;

  if (!public_id) {
    return res
      .status(400)
      .json(
        customResponse({ message: "No public_id provided", statusCode: 400 })
      );
  }

  await handleRequests({
    promise: cloudinaryDelete(public_id),
    message: "File deleted successfully",
    res,
    callback: () => {
      if (!public_id) {
        return res.status(400).json(
          customResponse({
            message: "Failed to delete file",
            statusCode: 400,
          })
        );
      }
    },
  });
};
