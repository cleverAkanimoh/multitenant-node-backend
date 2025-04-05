import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { frontendUrl } from "../core/configs";
import { debugLog } from "./debugLog";
import { generateEmailTemplate } from "./generateEmailTemplate";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.ipage.com",
  port: 465,
  secure: true,
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
    throw new Error("Failed to send mail");
  }
};

export const sendDeveloperEmail = ({ error }: { error: any }) => {
  customSendMail({
    email: "cleverakanimoh02@gmail.com",
    subject: "Emetrics Error Message Notification",
    name: "E-Metrics Suite",
    html: generateEmailTemplate({
      message: error instanceof Error ? error.message : "An error occurred",
      title: "Developer Error Notification",
      buttonText: "View Details",
      buttonLink: frontendUrl || "",
    }),
  });
};
