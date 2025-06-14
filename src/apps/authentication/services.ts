import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { frontendUrl } from "../../core/configs";
import { TToken } from "../../types/token";
import { customSendMail } from "../../utils/customSendMail";
import { generateEmailTemplate } from "../../utils/generateEmailTemplate";
import GlobalUser from "../shared/models";
import { cleanUserData } from "../users/services";

export const JWT_SECRET = process.env.JWT_SECRET as string;

export const generateJwtToken = (
  userId: string,
  tenantId: string,
  { expiresIn = "1h" }: { expiresIn?: any }
): string => {
  return jwt.sign({ userId, tenantId }, JWT_SECRET, { expiresIn });
};

export const verifyJwtToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as TToken;
};

export const sendAccountVerificationEmail = async (
  user: GlobalUser,
  newUser: boolean = true
) => {
  const activationToken = generateJwtToken(user.id || "", user.tenantId, {
    expiresIn: "1h",
  });

  const activationLink = `${frontendUrl}/verify-account?token=${activationToken}`;
  const cleanData = await cleanUserData?.(user);
  // debugLog({ user, cleanData });

  const html = generateEmailTemplate({
    title: newUser ? "Welcome to E-Metrics Suite!" : "Verify your account",
    message: `Hello ${cleanData?.firstName || user.email.split("@")[0]}, ${
      newUser ? "Welcome to E-Metrics Suite" : "Please verify your account"
    }. Kindly click the button below to activate your account`,
    buttonText: "Activate Account",
    buttonLink: activationLink,
  });

  await customSendMail({
    email: user.email,
    subject: "Activate Account",
    html,
  });
};

export const sendResetEmail = async (user: GlobalUser, token: string) => {
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
  const cleanData = await cleanUserData(user);
  await customSendMail({
    html: generateEmailTemplate({
      title: "Password Reset Request",
      message: `Hello ${
        cleanData.firstName || user.email.split(" ")[0]
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
  return await bcrypt.compare(password, hash);
};
