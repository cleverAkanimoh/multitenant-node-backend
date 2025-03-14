import { Request, Response, NextFunction } from "express";
import { prisma } from "../../core/prisma";
import { customResponse } from "../../utils/customResponse";
import { generateDefaultUsername } from "../../utils/generateDefaultUsername";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const designerId = req.company;
    const users = await prisma.user.findMany({
      where: { designerId: designerId },
    });
    res.json(
      customResponse({
        message: "Users retrieved successfully",
        data: users,
        statusCode: 200,
      })
    );
  } catch (err) {
    next(err);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const designerId = req.company || "";
    const { firstName, lastName, email, password } = req.body;
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        designerId,
        password,
        username: generateDefaultUsername(firstName),
      },
    });
    res.status(201).json(
      customResponse({
        message: "User created successfully",
        data: user,
        statusCode: 201,
      })
    );
  } catch (err) {
    next(err);
  }
};
