import type { User as UserUser } from "../apps/users/models/user";

declare global {
  namespace Express {
    interface Request {
      user?: UserUser | undefined;
      organization: string;
      tenantUserModel?: UserUser;
    }
  }
}