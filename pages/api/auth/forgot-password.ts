// api/auth/forgot-password.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { sendEmail } from "../../../utils/email/email";
import { ApiResponse } from "../../../utils/helper";
import jwt from "jsonwebtoken";
import { secret } from "../../../utils/auth/secret";

const prisma = new PrismaClient();

export default async function forgotPassword(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json(ApiResponse.error("Method Not Allowed"));
  }

  console.log("=====================================");
  console.log("handle function called");
  console.log("req.body:", req.body);
  console.log("=====================================");
  
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(ApiResponse.error("Email is required"));
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Changing the response here to directly inform the user
      return res.status(404).json(ApiResponse.error("Email not found in our database."));
    }

    if (!secret) throw new Error("JWT secret is undefined!");

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      secret,
      { expiresIn: "15m" }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const htmlContent = `
      <p>Hello,</p>
      <p>You have requested to reset your password. Please click on the link below to set a new password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      htmlContent,
    });

    return res
      .status(200)
      .json(
        ApiResponse.success(
          undefined,
          "A link to reset your password has been sent if the email is registered in our database."
        )
      );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(ApiResponse.error("Failed to handle forgot password request"));
  }
}