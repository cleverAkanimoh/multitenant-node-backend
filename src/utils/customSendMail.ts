import SibApiV3Sdk from "sib-api-v3-sdk";

const SENDINBLUE_API_KEY = process.env.SENDINBLUE_API_KEY as string;

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = SENDINBLUE_API_KEY;

const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

export const customSendMail = async ({
  email,
  html,
  subject,
  from = {
    email: process.env.EMAIL_USER,
    name: "E-Metrics Suite",
  },
}: {
  email: string;
  html: string;
  subject: string;
  from?: object;
}) => {
  sendSmtpEmail.sender = from;
  sendSmtpEmail.to = [{ email }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;

  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
