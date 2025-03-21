import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASSWORD as string,
  },
});

export const customSendMail = async ({
  email,
  html,
  subject,
  from = {
    email: process.env.EMAIL_USER as string,
    name: "E-Metrics Suite",
  },
}: {
  email: string;
  html: string;
  subject: string;
  from?: { email: string; name: string };
}) => {
  try {
    const info = await transporter.sendMail({
      from: `"${from.name}" <${from.email}>`, // Sender name and email
      to: email,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
