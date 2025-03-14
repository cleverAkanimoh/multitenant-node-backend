import { Request, Response } from "express";
import { designerSchema, loginSchema } from "../schemas";
import { prisma } from "../../../core/prisma";
import { customResponse } from "../../../utils/customResponse";
import {
  generateJwtToken,
  hashPassword,
  sendAccountVerificationEmail,
  verifyJwtToken,
  verifyPassword,
} from "../services";

export const registerDesigner = async (req: Request, res: Response) => {
  const { error } = designerSchema.validate(req.body);
  if (error)
    return res.status(400).json(
      customResponse({
        message: error.details[0].message,
        statusCode: 400,
        data: error.details,
      })
    );

  try {
    const { name, email, password } = req.body;

    const existingDesigner = await prisma.company.findUnique({
      where: { name },
    });
    if (existingDesigner) {
      return res.status(400).json(
        customResponse({
          message: "Designer name already taken",
          statusCode: 400,
        })
      );
    }

    const hashedPassword = await hashPassword(password);
    const newDesigner = await prisma.company.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isActive: null,
      },
    });

    await sendAccountVerificationEmail({
      email,
      name: newDesigner.name,
      userId: newDesigner.id,
    });

    res.status(201).json(
      customResponse({
        message: `Designer ${name} registered successfully!`,
        statusCode: 201,
      })
    );
  } catch (error) {
    res.status(500).json(
      customResponse({
        message: "Designer account registration failed",
        statusCode: 500,
        data: error,
      })
    );
  }
};

export const loginDesigner = async (req: Request, res: Response) => {
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
    const company = await prisma.company.findUnique({ where: { email } });

    if (!company || !(await verifyPassword(password, company.password))) {
      return res
        .status(401)
        .json(
          customResponse({ message: "Invalid credentials", statusCode: 401 })
        );
    }

    const token = generateJwtToken(company.id, { expiresIn: "24d" });

    const response = res.json(
      customResponse({
        message: "Login was successful",
        data: { token },
        statusCode: 200,
      })
    );

    response.cookie("nui-auth-cookies", token, {
      httpOnly: true,
      signed: true,
      // secure: true,
    });
  } catch (error) {
    res.status(500).json(
      customResponse({
        message: "Login failed",
        statusCode: 500,
        data: error,
      })
    );
  }
};

export const getCurrentDesigner = async (req: Request, res: Response) => {
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
          message: "Unauthorized: Invalid token",
          statusCode: 401,
        })
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: decoded.id },
    });

    if (!company) {
      return res.status(404).json(
        customResponse({
          message: "Designer not found",
          statusCode: 404,
        })
      );
    }

    res.json(
      customResponse({
        message: "Designer retrieved successfully",
        data: {
          ...company,
          hasCompletedProfile: !!company.bio && !!company.website,
        },
        statusCode: 200,
      })
    );
  } catch (error) {
    res.status(500).json(
      customResponse({
        message: "Failed to retrieve company",
        statusCode: 500,
        data: error,
      })
    );
  }
};
