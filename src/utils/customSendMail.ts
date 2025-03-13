import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER as string;
const EMAIL_PASS = process.env.EMAIL_PASS as string;

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});
export default transporter;

export const customSendMail = async ({
  email,
  html,
  subject,
  from = `NUI Fashion <${EMAIL_USER}>`,
}: {
  email: string;
  html: string;
  subject: string;
  from?: string;
}) => {
  await transporter.sendMail({ from, to: email, subject, html });
};
