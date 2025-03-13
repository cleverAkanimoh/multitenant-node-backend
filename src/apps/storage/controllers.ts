import { Request, Response } from "express";
import { supabase } from "../../core/supabaseClient";
import { customResponse } from "../../utils/customResponse";
import { publicBucketName } from "../../core/constants";

export const uploadFiles = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { originalname, buffer, mimetype } = req.file;

    const filePath = `uploads/${Date.now()}_${originalname}`;

    const { data, error } = await supabase.storage
      .from(publicBucketName)
      .upload(filePath, buffer, { contentType: mimetype });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(publicBucketName)
      .getPublicUrl(filePath);

    return res.json(
      customResponse({
        message: "",
        data: { url: publicUrlData.publicUrl },
        statusCode: 200,
      })
    );
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const retrieveFile = async (req: Request, res: Response) => {
  const { filename } = req.params;

  const { data } = supabase.storage
    .from(publicBucketName)
    .getPublicUrl(`uploads/${filename}`);

  return res.json(
    customResponse({
      message: `${filename} retrieved successfully`,
      data: { url: data.publicUrl },
      statusCode: 200,
    })
  );
};

export const deleteFile = async (req: Request, res: Response) => {
  const { filename } = req.params;

  const { error } = await supabase.storage
    .from(publicBucketName)
    .remove([`uploads/${filename}`]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ message: "File deleted successfully" });
};
