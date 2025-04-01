import { NextFunction, Request, Response } from "express";
import Company from "../(dashboard)/company/models";
import { getTenantModel } from "../../core/multitenancy";
import { customResponse } from "../../utils/customResponse";
import { debugLog } from "../../utils/debugLog";
import { findGlobalUserById } from "../shared/services";
import User from "../users/models/user";
import { verifyJwtToken } from "./services";

declare global {
  namespace Express {
    interface Request {
      user?: User | undefined;
      company: string;
      tenantUserModel?: User;
      tenantCompanyModel?: Company;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token)
    return res.status(401).json({ error: "You are not supposed to be here" });

  try {
    const decoded = verifyJwtToken(token);

    const gUser = await findGlobalUserById(decoded.userId);

    if (!gUser) throw new Error("Invalid token or expired token");

    const TenantUser = getTenantModel(User, decoded.tenantId);

    const user = await TenantUser.findByPk(decoded.userId);

    req.user = user;
    req.company = decoded.tenantId;
    req.tenantUserModel = getTenantModel(User, decoded.tenantId);
    req.tenantCompanyModel = getTenantModel(Company, decoded.tenantId);
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
