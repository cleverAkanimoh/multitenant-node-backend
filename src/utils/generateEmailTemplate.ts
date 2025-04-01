import dotenv from "dotenv";

dotenv.config();

export const generateEmailTemplate = ({
  title,
  message,
  buttonText,
  buttonLink,
  brandName = "E-Metrics Suite",
}: {
  title: string;
  message: string;
  buttonText: string;
  buttonLink: string;
  brandName?: string;
}) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${brandName}</title>
    <!-- Google Fonts are not supported in many email clients, so fallback fonts will be used -->
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
        background-color: #f4f4f4;
        color: #333;
        margin: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .header {
      display:flex;
        gap:4px;
        background-color: #0b3178;
        padding: 20px;
        text-align: center;
      }
      .header img {
        max-width: 100%;
        height: auto;
        margin-bottom: 10px;
      }
      .header h1 {
        color: #ffffff;
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 20px;
      }
      .content h2 {
        color: #0b3178;
        font-size: 20px;
        margin-bottom: 10px;
      }
      .content p {
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 20px;
      }
      .buttonLink {
        display: inline-block;
        padding: 12px 24px;
        font-size: 16px;
        color: #ffffff !important;
        background-color: #0b3178 !important;
        text-decoration: none !important;
        border-radius: 5px !important;
        font-weight: bold !important;
        text-align: center !important;
      }
      .content .note {
        font-size: 14px;
        color: #666;
        margin-top: 20px;
      }
      .footer {
        background-color: #f9f9f9;
        padding: 20px;
        text-align: center;
        border-top: 1px solid #ddd;
      }
      .footer p {
        font-size: 14px;
        color: #666;
        margin: 0;
      }
      .footer a {
        color: #0b3178;
        text-decoration: none;
      }
      @media only screen and (max-width: 600px) {
        .container {
          width: 100% !important;
          border-radius: 0 !important;
        }
        h1, h2 {
          font-size: 18px !important;
        }
        p, a {
          font-size: 14px !important;
        }
        a {
          padding: 10px 20px !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://via.placeholder.com/150x50?text=${brandName}" alt="${brandName}" />
        <h1>${brandName}</h1>
      </div>
      <div class="content">
        <h2>${title}</h2>
        <p>${message}</p>
        <a href="${buttonLink}" class="buttonLink">${buttonText}</a> <br />
        <a href="${buttonLink}">${buttonLink}</a>
        
        <p class="note">If you didn't request this, please ignore this email.</p>
      </div>
      <div class="footer">
        <p>Need help? Contact us at <a href="${process.env.EMAIL_USER}">${
  process.env.EMAIL_USER
}</a></p>
        <p>&copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;
