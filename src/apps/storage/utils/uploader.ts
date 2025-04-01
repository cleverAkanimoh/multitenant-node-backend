import cloudinary from "cloudinary";

export const cloudinaryUploader = async (filePath: string) => {
   return await cloudinary.v2.uploader.upload(filePath);
}
export const cloudinaryDelete = async (public_id: string) => {
  return await cloudinary.v2.uploader.destroy(public_id);
};