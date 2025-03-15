import cloudinary from "cloudinary";

export const cloudinaryUploader = async (filePath: string) => {
   return await cloudinary.v2.uploader.upload(filePath);
}