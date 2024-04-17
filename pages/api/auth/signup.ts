// api/auth/signup.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { ApiResponse } from "../../../utils/helper";

const prisma = new PrismaClient();

export default async function signup(
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

  const { email, password, confirmPassword} = req.body;

  if (!email || !password || !confirmPassword) {
    return res.status(400).json(ApiResponse.error("Missing Required Fields"));
  }

  if (password !== confirmPassword) {
    return res.status(400).json(ApiResponse.error("Passwords do not match"));
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json(ApiResponse.error("Email already in use"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    return res
      .status(200)
      .json(ApiResponse.success(user, "BASE.SUCCESS", undefined));
  } catch (error) {
    console.error(error);
    return res.status(500).json(ApiResponse.error("BASE.ERROR"));
  }
}
