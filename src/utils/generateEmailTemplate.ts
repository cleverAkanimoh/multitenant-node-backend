export const generateEmailTemplate = ({
  title,
  message,
  buttonText,
  buttonLink,
}: {
  title: string;
  message: string;
  buttonText: string;
  buttonLink: string;
}) => `
  <div style="font-family: Arial, sans-serif; padding: 20px;text-align: center;">
    <h2>${title}</h2>
    <p>${message}</p>
    <a href="${buttonLink}" 
       style="display: inline-block; padding: 10px 20px; font-size: 16px; 
              color: #ffffff; background-color: #0b3178; text-decoration: none; 
              border-radius: 5px;">
      ${buttonText}
    </a>
    <p>If you didn't request this, please ignore this email.</p>
    <br/>
    <br/>
   <div style="text-align: start;">
    <p>Thanks</p> 
    <p>The E-Metrics Team</p>
   </div>
  </div>
`;
