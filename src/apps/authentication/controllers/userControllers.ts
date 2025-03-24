import { Request, Response } from "express";
import { COOKIE_NAME } from "../../../core/constants";
import { customResponse } from "../../../utils/customResponse";
import {
  handleRequests,
  handleValidationError,
} from "../../../utils/handleRequests";
import User, { Roles } from "../../users/models/user";
import {
  cleanUserData,
  createAdmin,
  createStaff,
  createSuperAdmin,
  deactivateUser,
  deleteUser,
  findUserByEmail,
} from "../../users/services";
import { AuthRequest } from "../middlewares";
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
export const registerUser = async (req: Request, res: Response) => {
  const { error } = userSchema.validate(req.body);
  if (error) return handleValidationError(res, error);

  const existingUser = await findUserByEmail(req.body.email.toLowerCase());

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

  if (isSuperAdmin) {
    const superAdminHasCreatedAnAccount = await User.findOne({
      where: { tenantId: req.body.tenantId },
    });

    if (superAdminHasCreatedAnAccount) {
      return res.status(400).json(
        customResponse({
          message: "Company already exists",
          statusCode: 400,
        })
      );
    }
  }

  const checkUserRole = isSuperAdmin
    ? createSuperAdmin(req.body)
    : isHr
    ? createAdmin(req.body)
    : createStaff(req.body);

  const checkUserType = isSuperAdmin ? "Company" : isHr ? "Hr" : "Staff";

  return handleRequests({
    promise: checkUserRole,
    message: checkUserType + " created successfully",
    res,
    resData: (data) => cleanUserData(data),
  });
};

export const activateAccount = async (req: Request, res: Response) => {
  return handleRequests({
    promise: (async () => {
      const { token } = req.query;
      if (!token) throw new Error("Invalid activation token");

      const decoded = verifyJwtToken(token as string);
      if (!decoded) throw new Error("Invalid or expired token");

      return await User.update(
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
      const user = await findUserByEmail(email);
      if (!user || !(await verifyPassword(password, user.password))) {
        return res
          .status(400)
          .json(
            customResponse({ message: "Invalid credentials", statusCode: 400 })
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
export const changePassword = async (req: AuthRequest, res: Response) => {
  const { error } = changePasswordSchema.validate(req.body);
  if (error) return handleValidationError(res, error);

  return handleRequests({
    promise: (async () => {
      if (!req.user) throw new Error("Unauthorized");

      const user = req.user;
      if (!(await verifyPassword(req.body.oldPassword, user.password))) {
        throw new Error("Old password is incorrect");
      }

      const hashedPassword = await hashPassword(req.body.newPassword);
      await User.update(
        { password: hashedPassword },
        { where: { id: user.id } }
      );

      return "Password changed successfully";
    })(),
    message: null,
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
    message: "User retrieved successfully",
    res,
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
      const user = await findUserByEmail(email);
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
      await User.update(
        { password: hashedPassword },
        { where: { id: decoded.userId } }
      );

      return "Password reset successful";
    })(),
    message: null,
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
