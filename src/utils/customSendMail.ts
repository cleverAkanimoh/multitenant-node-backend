import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { debugLog } from "./debugLog";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASS as string,
  },
});

export const customSendMail = async ({
  email,
  html,
  subject,
  name = "E-Metrics Suite",
}: {
  email: string;
  html: string;
  subject: string;
  name?: string;
}) => {
  try {
    const info = await transporter.sendMail({
      from: `${name} <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
    });

    debugLog("Email sent:", info.messageId);
  } catch (error) {
    debugLog("Error sending email:", error);
    throw error;
  }
};
