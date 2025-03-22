import { NextFunction, Request, Response } from "express";
import User from "../users/models/user";
import { verifyJwtToken } from "./services";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const decoded = verifyJwtToken(token);
    const user = await User.findByPk(decoded.id);
    if (!user) throw new Error("No user found in request");
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
