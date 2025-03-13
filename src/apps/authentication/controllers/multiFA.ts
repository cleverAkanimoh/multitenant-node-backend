import { Response } from "express";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { AuthRequest } from "../middlewares";
import { customResponse } from "../../../utils/customResponse";
import { prisma } from "../../../core/prisma";

export const enableMfa = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json(customResponse({ message: "Unauthorized", statusCode: 401 }));
    }

    const secret = speakeasy.generateSecret({ length: 20 });

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { mfaSecret: secret.base32, isMfaEnabled: true },
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    res.json(
      customResponse({
        message: "Multi factor authentication enabled successfully",
        statusCode: 200,
        data: { qrCode, secret: secret.base32 },
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(
        customResponse({
          message: "Multi factor authentication setup failed",
          statusCode: 500,
        })
      );
  }
};

export const verifyMfa = async (req: AuthRequest, res: Response) => {
  const { otp } = req.body;

  if (!req.user) {
    return res
      .status(401)
      .json(customResponse({ message: "Unauthorized", statusCode: 401 }));
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });

  if (!user || !user.mfaSecret) {
    return res
      .status(400)
      .json(
        customResponse({
          message: "Multi factor authentication not set up",
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
    return res
      .status(400)
      .json(customResponse({ message: "Invalid OTP", statusCode: 400 }));
  }

  res.json(
    customResponse({
      message: "Multi factor authentication verified successfully",
      statusCode: 200,
    })
  );
};
