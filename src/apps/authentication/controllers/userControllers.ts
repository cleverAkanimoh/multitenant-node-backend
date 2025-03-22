import { Request, Response } from "express";
import { COOKIE_NAME } from "../../../core/constants";
import { validateRequest } from "../../../middlewares/validateRequests";
import { customResponse } from "../../../utils/customResponse";
import {
  handleRequests,
  handleValidationError,
} from "../../../utils/handleRequests";
import User, { Roles } from "../../users/models/user";
import {
  cleanUserData,
  createUser,
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
  generateToken,
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

export const registerUser = [
  validateRequest(userSchema),
  async (req: Request, res: Response) => {
    console.log("Registering user:", req.body);
    const existingUser = await findUserByEmail(req.body.email);
    if (existingUser) {
      return res.status(400).json(
        customResponse({
          message: "Email is already registered",
          statusCode: 400,
        })
      );
    }
    console.log({ role: Roles.SUPERADMIN, userRole: req.body.userRole });

    if (req.body.userRole === Roles.SUPERADMIN) {
      console.log("Reached here");
    }
    return handleRequests(
      createUser(req.body),
      "User created successfully",
      res
    );
  },
];

export const activateAccount = async (req: Request, res: Response) => {
  return handleRequests(
    (async () => {
      const { token } = req.query;
      if (!token) throw new Error("Invalid activation token");

      const decoded = verifyJwtToken(token as string);
      if (!decoded) throw new Error("Invalid or expired token");

      await User.update({ isActive: true }, { where: { id: decoded.id } });
      return "Account activated successfully!";
    })(),
    null,
    res
  );
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

  return handleRequests(
    (async () => {
      const { email, password } = req.body;
      const user = await findUserByEmail(email);
      if (!user || !(await verifyPassword(password, user.password))) {
        throw new Error("Invalid credentials");
      }

      const token = generateToken(user.id, user.tenantId);

      res.cookie(COOKIE_NAME, token, { httpOnly: true, signed: true });

      return { token, user: cleanUserData(user) };
    })(),
    "Login was successful",
    res
  );
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

  return handleRequests(
    (async () => {
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
    null,
    res
  );
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
  return handleRequests(
    (async () => {
      const user = req.user;
      if (!user) throw new Error("User not found");

      return user;
    })(),
    "User retrieved successfully",
    res
  );
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

  return handleRequests(
    (async () => {
      const { email } = req.body;
      const user = await findUserByEmail(email);
      if (!user) throw new Error("User not found");

      const resetToken = generateToken(user.id, "1h");
      await sendResetEmail(user, resetToken);

      return "Password reset email sent";
    })(),
    null,
    res
  );
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

  return handleRequests(
    (async () => {
      const { token, newPassword } = req.body;
      const decoded = verifyJwtToken(token) as { id: string };
      if (!decoded) throw new Error("Invalid or expired token");

      const hashedPassword = await hashPassword(newPassword);
      await User.update(
        { password: hashedPassword },
        { where: { id: decoded.id } }
      );

      return "Password reset successful";
    })(),
    null,
    res
  );
};
