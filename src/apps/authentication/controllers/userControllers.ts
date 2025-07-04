import { Request, Response } from "express";
import { COOKIE_NAME } from "../../../core/constants";
import { getTenantModel } from "../../../core/multitenancy";
import { customResponse } from "../../../utils/customResponse";
import {
  handleRequests,
  handleValidationError,
} from "../../../utils/handleRequests";
import GlobalUser from "../../shared/models";
import { findGlobalUserByEmail } from "../../shared/services";
import User, { Roles } from "../../users/models/user";
import {
  cleanUserData,
  createAdmin,
  createStaff,
  createSuperAdmin,
  deactivateUser,
  deleteUser,
} from "../../users/services";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  userSchema,
} from "../schemas";
import {
  generateJwtToken,
  hashPassword,
  sendAccountVerificationEmail,
  sendResetEmail,
  verifyJwtToken,
  verifyPassword,
} from "../services";

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Clever Akanimoh"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "cleverakanimoh02@gmail.com"
 *               tenantId:
 *                 type: string
 *                 example: "blt"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "User.1234"
 *               userRole:
 *                 type: string
 *                 enum: [admin, employer, user]
 *                 example: "employer"
 *               mfaSecret:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               isStaff:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *               isActive:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *               isMfaEnabled:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *               deletedAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Email is already registered
 *       500:
 *         description: Internal Server Error
 */
export const registerUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { error } = userSchema.validate(req.body);
  if (error) return handleValidationError(res, error);

  const existingUser = await findGlobalUserByEmail(
    req.body.email.toLowerCase()
  );

  if (existingUser) {
    return res.status(400).json(
      customResponse({
        message: "Email is already registered",
        statusCode: 400,
      })
    );
  }

  const isSuperAdmin = req.body.userRole === Roles.SUPERADMIN;
  const isHr = req.body.userRole === Roles.ADMIN;

  const checkUserRole = isSuperAdmin
    ? createSuperAdmin(req.body)
    : isHr
    ? createAdmin(req.body)
    : createStaff(req.body);

  const checkUserType = isSuperAdmin ? "Company" : isHr ? "Hr" : "Staff";

  return handleRequests({
    promise: checkUserRole,
    message:
      checkUserType +
      " created successfully, check your email to activate account",
    res,
    resData: (_) => null,
  });
};

export const activateAccount = async (req: Request, res: Response) => {
  return handleRequests({
    promise: (async () => {
      const { token } = req.query;
      if (!token)
        return res.status(400).json(
          customResponse({
            message: "No activation token provided",
            statusCode: 400,
          })
        );

      const decoded = verifyJwtToken(token as string);
      if (!decoded)
        return res.status(400).json(
          customResponse({
            message: "Invalid or expired token",
            statusCode: 400,
          })
        );

      const TenantUser = getTenantModel(User, decoded.tenantId);

      const user = await TenantUser.findByPk(decoded.userId);

      if (user.isActive)
        return res.status(400).json(
          customResponse({
            message: "Account is already active",
            statusCode: 400,
          })
        );

      return await TenantUser.update(
        { isActive: true },
        { where: { id: decoded.userId } }
      );
    })(),
    message: "Account activated successfully!",
    res,
  });
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
export const login = async (req: Request, res: Response) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return handleValidationError(res, error);

  return handleRequests({
    promise: (async () => {
      const { email, password } = req.body;
      const globalUser = await findGlobalUserByEmail(email.toLowerCase());

      if (
        !globalUser?.email ||
        !(await verifyPassword(password, globalUser.password))
      ) {
        return res
          .status(400)
          .json(
            customResponse({ message: "Invalid credentials", statusCode: 400 })
          );
      }

      const TenantUser = getTenantModel(User, globalUser.tenantId);

      const user = await TenantUser.findOne({
        where: { email: globalUser.email },
      });

      if (!user.isActive) {
        await sendAccountVerificationEmail(user, false);
        return res.status(400).json(
          customResponse({
            message: "Please check your mail to activate your account",
            statusCode: 400,
          })
        );
      }
      const token = generateJwtToken(user.id, user.tenantId, {
        expiresIn: "21d",
      });
      res.cookie(COOKIE_NAME, token, { httpOnly: true, signed: true });

      return { token, user: cleanUserData(user) };
    })(),
    message: "Login was successful",
    res,
  });
};

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Old password is incorrect
 *       401:
 *         description: Unauthorized
 */
export const changePassword = async (req: Request, res: Response) => {
  const { error } = changePasswordSchema.validate(req.body);
  if (error) return handleValidationError(res, error);

  return handleRequests({
    promise: (async () => {
      if (!req.user) throw new Error("You're not supposed to be here");

      const user = req.user;
      if (
        !(await verifyPassword(req.body.oldPassword, (user as any).password))
      ) {
        throw new Error("Old password is incorrect");
      }

      const hashedPassword = await hashPassword(req.body.newPassword);

      await User.update(
        { password: hashedPassword },
        { where: { id: (user as any).id } }
      );

      return ;
    })(),
    message: "Password changed successfully",
    res,
  });
};

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
export const logout = (req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME);
  res.json(customResponse({ message: "Logout successful", statusCode: 200 }));
};

export const getCurrentUser = async (req: Request, res: Response) => {
  return handleRequests({
    promise: (async () => {
      const user = req.user;
      if (!user) throw new Error("User not found");

      return user;
    })(),
    message: null,
    res,
    resData: (user) => cleanUserData(user as GlobalUser),
  });
};

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 */
export const forgotPassword = async (req: Request, res: Response) => {
  const { error } = forgotPasswordSchema.validate(req.body);
  if (error) return handleValidationError(res, error);

  return handleRequests({
    promise: (async () => {
      const { email } = req.body;
      const user = await GlobalUser.findOne({ where: { email } });
      if (!user) throw new Error("User not found");

      const resetToken = generateJwtToken(user.id, user.tenantId, {
        expiresIn: "1h",
      });

      await sendResetEmail(user, resetToken);
    })(),
    message: "Password reset email sent",
    res,
  });
};

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Failed to reset password
 */
export const resetPassword = async (req: Request, res: Response) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) return handleValidationError(res, error);

  return handleRequests({
    promise: (async () => {
      const { token, newPassword } = req.body;
      const decoded = verifyJwtToken(token);
      if (!decoded) throw new Error("Invalid or expired token");

      const hashedPassword = await hashPassword(newPassword);

      const TenantUser = getTenantModel(User, decoded.tenantId);

      await TenantUser.update(
        { password: hashedPassword },
        { where: { id: decoded.userId } }
      );
    })(),
    message: "Password reset successful",
    res,
  });
};

export const deactivateUserAccount = async (req: Request, res: Response) => {
  return handleRequests({
    promise: (async () => await deactivateUser(req.params.id))(),
    message: "Account deactivated successfully",
    statusCode: 204,
    res,
  });
};

// Delete a user account
export const deleteUserAccount = async (req: Request, res: Response) => {
  return handleRequests({
    promise: (async () => await deleteUser(req.params.id))(),
    message: "Account deleted successfully",
    statusCode: 204,
    res,
  });
};
