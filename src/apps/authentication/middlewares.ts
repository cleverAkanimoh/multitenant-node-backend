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

    const gUser = await findUserById(decoded.userId);

    if (!gUser) throw new Error("Invalid token or expired token");

    const TenantUser = getTenantModel(User, decoded.tenantId);

    const user = await TenantUser.findByPk(decoded.userId);

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
