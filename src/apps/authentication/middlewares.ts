import { NextFunction, Request, Response } from "express";
import { customResponse } from "../../utils/customResponse";
import { debugLog } from "../../utils/debugLog";
import User from "../users/models/user";
import { verifyJwtToken } from "./services";

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticate = async (
  req: Request,
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
    req.company = decoded.tenantId;
    next();
  } catch (error) {
    debugLog(error);

    return res.status(401).json(
      customResponse({
        message: (error as Error)?.message || "Authentication failed",
        data: error,
        statusCode: 401,
      })
    );
  }
};
