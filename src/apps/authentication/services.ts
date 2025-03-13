import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "../../core/prisma";
import { frontendUrl } from "../../core/configs";
import { customSendMail } from "../../utils/customSendMail";
import { generateEmailTemplate } from "../../utils/generateEmailTemplate";
import { designerType } from "../../core/constants";

export const JWT_SECRET = process.env.JWT_SECRET as string;

export const generateJwtToken = (
  userId: string,
  { expiresIn = "1h" }: { expiresIn?: any }
): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn });
};

export const verifyJwtToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as { id: string };
};

export const sendAccountVerificationEmail = async ({
  email,
  name,
  userId,
}: {
  email: string;
  name: string | null;
  userId: string;
}) => {
  const activationToken = generateJwtToken(userId, { expiresIn: "12h" });

  const activationLink = `${frontendUrl}/auth/activate?token=${activationToken}`;

  await customSendMail({
    email: email,
    subject: "Activate Your Nui Fashion Account",
    html: generateEmailTemplate({
      title: "Welcome to Nui Fashion!",
      message: `Hello ${
        name || email
      }, click the button below to activate your account:`,
      buttonText: "Activate Account",
      buttonLink: activationLink,
    }),
  });
};

export const sendResetEmail = async (email: string, token: string) => {
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
  await customSendMail({
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. The link expires in 1 hour.</p>`,
    email,
    subject: "Password Reset Request",
  });
};

export const resetPassword = async (
  token: string,
  newPassword: string,
  type?: string
) => {
  try {
    const { id } = verifyJwtToken(token);
    const hashedPassword = await hashPassword(newPassword);

    if (type === designerType) {
      await prisma.designer.update({
        where: { id },
        data: { password: hashedPassword },
      });
    } else {
      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });
    }

    return true;
  } catch (error) {
    return false;
  }
};

// Hash password before saving user
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare plain password with hashed password
export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Generate JWT token
export const generateToken = (userId: string, designerId: string): string => {
  return jwt.sign({ userId, designerId }, JWT_SECRET, { expiresIn: "7d" });
};

// Verify JWT token
export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
