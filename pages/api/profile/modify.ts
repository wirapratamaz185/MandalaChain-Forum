import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../utils/helper";
import jwt from "jsonwebtoken";
import { secret } from "../../../utils/auth/secret";

const prisma = new PrismaClient();

export default async function PATCH(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "PATCH") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  console.log("=====================================");
  console.log("handle function called");
  console.log("req.body:", req.body);
  console.log("=====================================");

  const { username, imageUrl } = req.body;

  // Extract the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1] || "";

  // Verify and decode the token
  const decodedToken = jwt.verify(token, secret || "") as jwt.JwtPayload;
  console.log("decodedToken:", decodedToken);

  // get the user id from the decoded token
  const userId = decodedToken.id;

  try {
    // Update the user's profile
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username: username,
        imageUrl: imageUrl,
      },
      select: {
        id: true,
        username: true,
        imageUrl: true,
      },
    });
    res
      .status(200)
      .json(ApiResponse.success(updatedUser, "Profile updated successfully"));
  } catch (error) {
    console.error("Error updating user profile:", error);
    res
      .status(500)
      .json(ApiResponse.error("An error occurred while updating the profile"));
  }
}
