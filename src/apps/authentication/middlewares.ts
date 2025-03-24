import { NextFunction, Request, Response } from "express";
import { customResponse } from "../../utils/customResponse";
import { debugLog } from "../../utils/debugLog";
import User from "../users/models/user";
import { verifyJwtToken } from "./services";

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "You are not authorized" });

  try {
    const decoded = verifyJwtToken(token);

    const user = await User.findByPk(decoded.userId);
    if (!user) throw new Error("No user found in request");

    req.user = user;
    next();
  } catch (error) {
    debugLog(error);

    res.status(401).json(
      customResponse({
        message: (error as Error)?.message || "",
        data: error,
        statusCode: 401,
      })
    );
  }
};
