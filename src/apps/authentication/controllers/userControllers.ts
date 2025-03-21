import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { validateRequest } from "../../../middlewares/validateRequests";
import { customResponse } from "../../../utils/customResponse";
import { handleRequests } from "../../../utils/handleRequests";
import User from "../../users/models/user";
import { createUser, getSingleUser } from "../../users/services";
import { AuthRequest } from "../middlewares";
import { changePasswordSchema, loginSchema, userSchema } from "../schemas";
import {
  generateToken,
  hashPassword,
  JWT_SECRET,
  verifyJwtToken,
  verifyPassword,
} from "../services";

export const registerUser = [
  validateRequest(userSchema),
  async (req: Request, res: Response) => {
    const existingUser = await getSingleUser(req.body.email);
    return handleRequests(
      createUser(req.body),
      "User created successfully",
      res,
      existingUser
        ? async () =>
            res.status(400).json(
              customResponse({
                message: "Email is already registered",
                statusCode: 400,
              })
            )
        : undefined
    );
  },
];
const handleValidationError = (res: Response, error: any) => {
  return res.status(400).json(
    customResponse({
      message: error.details[0].message,
      statusCode: 400,
      data: error.details,
    })
  );
};

const findUserById = async (id: string, attributes?: string[]) => {
  return User.findByPk(id, { attributes });
};

const findUserByEmail = async (email: string) => {
  return User.findOne({ where: { email } });
};

export const activateAccount = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (!token)
      return res.status(400).json(
        customResponse({
          message: "Invalid activation token",
          statusCode: 400,
        })
      );

    const decoded = jwt.verify(token as string, JWT_SECRET) as {
      userId: string;
    };

    if (!decoded)
      return res.status(400).json(
        customResponse({
          message: "Invalid or expired token",
          statusCode: 400,
        })
      );

    await User.update({ isActive: true }, { where: { id: decoded.userId } });

    res.json(
      customResponse({
        message: "Account activated successfully!",
        statusCode: 200,
      })
    );
  } catch (error) {
    res.status(500).json(
      customResponse({
        message: "Failed to activate account",
        statusCode: 500,
      })
    );
  }
};

export const login = async (req: Request, res: Response) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return handleValidationError(res, error);

  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.password))) {
      return res
        .status(401)
        .json(
          customResponse({ message: "Invalid credentials", statusCode: 401 })
        );
    }

    const token = generateToken(user.id, "");
    res.cookie("auth-cookies", token, { httpOnly: true, signed: true });
    res.json(
      customResponse({
        message: "Login was successful",
        data: { token, user },
        statusCode: 200,
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(customResponse({ message: "Login failed", statusCode: 500 }));
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { error } = changePasswordSchema.validate(req.body);
  if (error) return handleValidationError(res, error);

  try {
    if (!req.user)
      return res
        .status(401)
        .json(customResponse({ message: "Unauthorized", statusCode: 401 }));

    const user = await findUserById(req.user.userId);
    if (!user)
      return res
        .status(404)
        .json(customResponse({ message: "User not found", statusCode: 404 }));

    if (!(await verifyPassword(req.body.oldPassword, user.password))) {
      return res.status(400).json(
        customResponse({
          message: "Old password is incorrect",
          statusCode: 400,
        })
      );
    }

    const hashedPassword = await hashPassword(req.body.newPassword);
    await User.update({ password: hashedPassword }, { where: { id: user.id } });

    res.json(
      customResponse({
        message: "Password changed successfully",
        statusCode: 200,
      })
    );
  } catch (error) {
    res.status(500).json(
      customResponse({
        message: "Failed to change password",
        statusCode: 500,
      })
    );
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json(
        customResponse({
          message: "Unauthorized: No token provided",
          statusCode: 401,
        })
      );
    }

    const decoded = verifyJwtToken(authHeader.split(" ")[1]) as { id: string };
    if (!decoded || !decoded.id) {
      return res
        .status(401)
        .json(customResponse({ message: "Invalid token", statusCode: 401 }));
    }

    const user = await findUserById(decoded.id, [
      "id",
      "firstName",
      "lastName",
      "email",
      "username",
      "designerId",
    ]);
    if (!user)
      return res
        .status(404)
        .json(customResponse({ message: "User not found", statusCode: 404 }));

    res.json(
      customResponse({
        message: "User retrieved successfully",
        data: user,
        statusCode: 200,
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(
        customResponse({ message: "Failed to retrieve user", statusCode: 500 })
      );
  }
};
