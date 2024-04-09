import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../utils/helper";
import jwt from "jsonwebtoken";
import { secret } from "../../../utils/auth/secret";

const prisma = new PrismaClient();

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  console.log("=====================================");
  console.log("handle function called");
  console.log("req.body:", req.body);
  console.log("=====================================");

  const { communityId: communityId } = req.query;

  // Extract the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1] || "";

  // Verify and decode the token
  const decodedToken = jwt.verify(token, secret || "") as jwt.JwtPayload;
  console.log("decodedToken:", decodedToken);

  // get the user id from the decoded token
  const userId = decodedToken.id;

  try {
    const existingSubscription = await prisma.subscriber.findFirst({
      where: {
        community_id: communityId as string,
        user_id: userId,
      },
    });

    if (existingSubscription) {
      return res
        .status(400)
        .json(
          ApiResponse.error("You are already subscribed to this community")
        );
    }

    const newSubscription = await prisma.subscriber.create({
      data: {
        community_id: communityId as string,
        user_id: userId,
      },
    });

    return res
      .status(200)
      .json(ApiResponse.success(newSubscription, "Successfully subscribed to community"));
  } catch (error) {
    console.error("Error in community subscribe:", error);
    return res.status(500).json(ApiResponse.error("Internal server error"));
  }
}
