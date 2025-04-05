import { NextFunction, Request, Response } from "express";
import { getTenantModel } from "../../core/multitenancy";
import { customResponse } from "../../utils/customResponse";
import { debugLog } from "../../utils/debugLog";
import User from "../users/models/user";
import { findUserById } from "../users/services";
import { verifyJwtToken } from "./services";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "You are not authorized" });

  try {
    const decoded = verifyJwtToken(token);

    const user = await findUserById(decoded.userId);

    if (!user)
      return res.status(400).json(
        customResponse({
          message: "Invalid or expired token",
          statusCode: 44,
        })
      );

    req.user = user;
    req.organization = decoded.tenantId;
    req.tenantUserModel = getTenantModel(User, decoded.tenantId);

    next();
  } catch (error) {
    debugLog("Authenticate middleware ", error);

    return res.status(401).json(
      customResponse({
        message: (error as Error)?.message || "Authentication failed",
        data: error,
        statusCode: 401,
      })
    );
  }
};
