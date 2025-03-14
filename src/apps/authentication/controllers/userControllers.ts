import { Request, Response } from "express";
import Joi from "joi";
import jwt from "jsonwebtoken";
import {
  generateJwtToken,
  generateToken,
  hashPassword,
  JWT_SECRET,
  resetPassword,
  sendAccountVerificationEmail,
  sendResetEmail,
  verifyJwtToken,
  verifyPassword,
} from "../services";
import { prisma } from "../../../core/prisma";
import { customResponse } from "../../../utils/customResponse";
import { AuthRequest } from "../middlewares";
import { designerType } from "../../../core/constants";
import { loginSchema, userSchema } from "../schemas";
import { generateDefaultUsername } from "../../../utils/generateDefaultUsername";

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  type: Joi.string().valid("user", "company").required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  type: Joi.string().valid("user", "company").required(),
});

const resendActivationEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  type: Joi.string().valid("user", "company").required(),
});

const verifyAccountSchema = Joi.object({
  token: Joi.string().required(),
});

export const registerUser = async (req: Request, res: Response) => {
  const { error } = userSchema.validate(req.body);
  if (error)
    return res.status(400).json(
      customResponse({
        message: error.details[0].message,
        statusCode: 400,
        data: error.details,
      })
    );

  try {
    const { email, password, firstName, lastName, designerId } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json(
        customResponse({
          message: "Email is already registered",
          statusCode: 400,
        })
      );

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username: generateDefaultUsername(firstName),
        firstName,
        lastName,
        designerId,
        isActive: null,
      },
    });

    await sendAccountVerificationEmail({
      email,
      name: newUser.firstName,
      userId: newUser?.id,
    });

    res.status(201).json(
      customResponse({
        message:
          "Registration successful! Check your email to activate your account.",
        statusCode: 201,
      })
    );
  } catch (error) {
    res.status(500).json(
      customResponse({
        message: "Registration failed",
        data: error,
        statusCode: 500,
      })
    );
  }
};

export const activateAccount = async (req: Request, res: Response) => {
  const { error } = verifyAccountSchema.validate(req.query);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json(
        customResponse({
          message: "Invalid activation token",
          statusCode: 400,
        })
      );
    }

    const decoded = jwt.verify(token as string, JWT_SECRET) as {
      userId: string;
    };

    if (!decoded) {
      res.status(400).json(
        customResponse({
          message: "Invalid or expired token",
          statusCode: 400,
        })
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: { isActive: new Date() },
    });

    res.json(
      customResponse({
        message: "Account activated successfully!",
        statusCode: 200,
        data: { user: updatedUser },
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
  if (error)
    return res.status(400).json(
      customResponse({
        message: error.details[0].message,
        statusCode: 400,
        data: error.details,
      })
    );

  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(user.id, user.designerId);

    const response = res.json(
      customResponse({
        message: "Login was successful",
        data: { token, user },
        statusCode: 200,
      })
    );

    response.cookie("auth-cookies", token, {
      httpOnly: true,
      signed: true,
      // secure: true,
    });
  } catch (error) {
    res
      .status(500)
      .json(customResponse({ message: "Login failed", statusCode: 500 }));
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { error } = changePasswordSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const { oldPassword, newPassword } = req.body;

    if (!req.user)
      return res.status(401).json(
        customResponse({
          message: "You are not authorized to perform this action",
          statusCode: 401,
        })
      );

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user)
      return res
        .status(404)
        .json(customResponse({ message: "User not found", statusCode: 404 }));

    const isValid = await verifyPassword(oldPassword, user.password);
    if (!isValid)
      return res.status(400).json(
        customResponse({
          message: "Old password is incorrect",
          statusCode: 400,
        })
      );

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

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

export const forgotPassword = async (req: Request, res: Response) => {
  const { error } = forgotPasswordSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const { email, type } = req.body;
    if (type === designerType) {
      const company = await prisma.company.findUnique({ where: { email } });

      if (!company)
        return res.status(404).json({ error: "Designer's account not found" });

      const token = generateJwtToken(company.id, { expiresIn: "1h" });
      await sendResetEmail(email, token);
    } else {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) return res.status(404).json({ error: "User not found" });

      const token = generateJwtToken(user.id, { expiresIn: "1h" });
      await sendResetEmail(email, token);
    }

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const resetUserPassword = async (req: Request, res: Response) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const { token, newPassword, type } = req.body;
    const success = await resetPassword(token, newPassword, type);

    if (!success)
      return res.status(400).json({ error: "Invalid or expired token" });

    res.json({ message: "Password successfully reset" });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset password" });
  }
};

export const resendActivationEmail = async (req: Request, res: Response) => {
  const { error } = resendActivationEmailSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const { email, type } = req.body;

    if (type === designerType) {
      const company = await prisma.company.findUnique({ where: { email } });
      if (!company) {
        return res.status(404).json(
          customResponse({
            message: "Designer's account was not found",
            statusCode: 404,
          })
        );
      }

      if (company.isActive) {
        return res.status(400).json(
          customResponse({
            message: "Account is already activated",
            statusCode: 400,
          })
        );
      }

      await sendAccountVerificationEmail({
        email,
        name: company.name,
        userId: company?.id,
      });
    } else {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json(
          customResponse({
            message: "User not found",
            statusCode: 404,
          })
        );
      }

      if (user.isActive) {
        return res.status(400).json(
          customResponse({
            message: "Account is already activated",
            statusCode: 400,
          })
        );
      }

      await sendAccountVerificationEmail({
        email,
        name: user.firstName,
        userId: user?.id,
      });
    }

    res.json(
      customResponse({
        message: "Activation email sent successfully!",
        statusCode: 200,
      })
    );
  } catch (error) {
    res.status(500).json(
      customResponse({
        message: "Failed to resend activation email",
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

    const token = authHeader.split(" ")[1];

    const decoded = verifyJwtToken(token) as { id: string };

    if (!decoded || !decoded.id) {
      return res.status(401).json(
        customResponse({
          message: "Invalid token",
          statusCode: 401,
        })
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        designerId: true,
      },
    });

    if (!user) {
      return res.status(404).json(
        customResponse({
          message: "User not found",
          statusCode: 404,
        })
      );
    }

    res.json(
      customResponse({
        message: "User retrieved successfully",
        data: user,
        statusCode: 200,
      })
    );
  } catch (error) {
    res.status(500).json(
      customResponse({
        message: "Failed to retrieve user",
        statusCode: 500,
        data: error,
      })
    );
  }
};
