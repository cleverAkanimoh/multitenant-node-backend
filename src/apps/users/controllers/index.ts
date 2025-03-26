import { Request, Response } from "express";
import { handleRequests } from "../../../utils/handleRequests";
import User from "../models/user";

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  await handleRequests({
    promise: User.findAll(),
    message: "Users retrieved successfully",

    res,
  });
};
