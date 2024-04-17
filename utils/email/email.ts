// utils/email/email.ts
import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import { ApiError } from "../response/baseError";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;

interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string; // Keep only the properties you are using
}

const createTransporter = async (): Promise<Transporter> => {
  const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground" // Redirect URI set in your Google Cloud project
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const accessToken = await new Promise<string>((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject("Failed to create access token: " + err);
      } else {
        resolve(token as string);
      }
    });
  });

  // Using the 'gmail' service shorthand to simplify OAuth2 setup
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });

  return transporter;
};

export const sendEmail = async ({ to, subject, htmlContent }: EmailOptions) => {
  const transporter = createTransporter();

  const mailOptions: SendMailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await (await transporter).sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new ApiError("Failed to send email", 500);
  }
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  // Using an HTML string for the email content allows for richer content presentation
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const htmlContent = `
      <p>You requested to reset your password.</p>
      <p>Please click the link below to proceed:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you did not request this change, please ignore this email.</p>
    `;

  await sendEmail({
    to,
    subject: "Reset Your Password",
    htmlContent,
  });
};
