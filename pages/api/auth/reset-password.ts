// api/auth/reset-password.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { ApiResponse } from "../../../utils/helper";
import jwt, { JwtPayload } from "jsonwebtoken";
import { secret } from "../../../utils/auth/secret";

interface TokenPayload extends JwtPayload {
  email: string; // Assuming your token also includes an email claim
}

const prisma = new PrismaClient();

export default async function resetPassword(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json(ApiResponse.error("Method Not Allowed"));
  }

  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json(ApiResponse.error("Token and New Password are required"));
  }

  try {
    const decoded = jwt.verify(token, secret as string) as TokenPayload; // Type assertion here

    const user = await prisma.user.findUnique({ where: { email: decoded.email } });

    if (!user) {
      return res.status(404).json(ApiResponse.error("User Not Found"));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: decoded.email },
      data: { password: hashedPassword },
    });

    return res.status(200).json(ApiResponse.success(undefined, "Password Reset Successfully"));
  } catch (error) {
    console.error(error);
    return res.status(500).json(ApiResponse.error("Failed to reset password"));
  }
}