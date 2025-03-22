import { Response } from "express";
import QRCode from "qrcode";
import speakeasy from "speakeasy";
import { customResponse } from "../../../utils/customResponse";
import { AuthRequest } from "../middlewares";

// Helper function to get the authenticated user
const getAuthenticatedUser = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res
      .status(401)
      .json(customResponse({ message: "Unauthorized", statusCode: 401 }));
    return null;
  }

  const user = req.user;
  if (!user) {
    res
      .status(404)
      .json(customResponse({ message: "User not found", statusCode: 404 }));
    return null;
  }

  return user;
};

// Enable MFA
export const enableMfa = async (req: AuthRequest, res: Response) => {
  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) return;

    const secret = speakeasy.generateSecret({ length: 20 });

    await user.update({
      mfaSecret: secret.base32,
      isMfaEnabled: true,
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    res.json(
      customResponse({
        message: "Multi-factor authentication enabled successfully",
        statusCode: 200,
        data: { qrCode, secret: secret.base32 },
      })
    );
  } catch (error) {
    res.status(500).json(
      customResponse({
        message: "Multi-factor authentication setup failed",
        statusCode: 500,
      })
    );
  }
};

// Verify MFA
export const verifyMfa = async (req: AuthRequest, res: Response) => {
  try {
    const { otp } = req.body;
    const user = await getAuthenticatedUser(req, res);
    if (!user) return;

    if (!user.mfaSecret) {
      return res.status(400).json(
        customResponse({
          message: "Multi-factor authentication not set up",
          statusCode: 400,
        })
      );
    }

    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: otp,
      window: 1,
    });

    if (!isValid) {
      return res.status(400).json(
        customResponse({
          message: "Invalid OTP",
          statusCode: 400,
        })
      );
    }

    res.json(
      customResponse({
        message: "Multi-factor authentication verified successfully",
        statusCode: 200,
      })
    );
  } catch (error) {
    res.status(500).json(
      customResponse({
        message: "Multi-factor authentication verification failed",
        statusCode: 500,
      })
    );
  }
};
