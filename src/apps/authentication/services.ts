import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { frontendUrl } from "../../core/configs";
import { TToken } from "../../types/token";
import { customSendMail } from "../../utils/customSendMail";
import { generateEmailTemplate } from "../../utils/generateEmailTemplate";
import User from "../users/models/user";

export const JWT_SECRET = process.env.JWT_SECRET as string;

export const generateJwtToken = (
  userId: string,
  { expiresIn = "1h" }: { expiresIn?: any }
): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn });
};

export const verifyJwtToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as TToken;
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
    subject: "Activate Your E-Metrics Account",
    html: generateEmailTemplate({
      title: "Welcome to E-Metrics Suite!",
      message: `Hello ${
        name || email.split(" ")[0]
      }, click the button below to activate your account:`,
      buttonText: "Activate Account",
      buttonLink: activationLink,
    }),
  });
};

export const sendResetEmail = async (user: User, token: string) => {
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
  await customSendMail({
    html: generateEmailTemplate({
      title: "Welcome to E-Metrics Suite!",
      message: `Hello ${
        user.name || user.email.split(" ")[0]
      }, click the button below to reset your account password`,
      buttonText: "Reset Password",
      buttonLink: resetUrl,
    }),
    email: user.email,
    subject: "Password Reset Request",
  });
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
export const generateToken = (userId: string, tenantId: string): string => {
  return jwt.sign({ userId, tenantId }, JWT_SECRET, { expiresIn: "7d" });
};

// Verify JWT token
export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
