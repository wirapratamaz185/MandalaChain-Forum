import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { prisma } from "../../../prisma/prisma";

export default async function handleSubscription(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  const { communityId } = req.query;

  if (!communityId || typeof communityId !== "string") {
    return res.status(400).json(ApiResponse.error("Community ID is required"));
  }

  let userId: string;
  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string") {
      throw new Error("Unauthorized: No userId decoded");
    }
    userId = payload;
  } catch (error) {
    console.error("Error in authorization:", error);
    return res.status(401).json(ApiResponse.error("Unauthorized"));
  }

  try {
    // Check if the user is already subscribed
    const existingSubscription = await prisma.subscriber.findFirst({
      where: {
        community_id: communityId,
        user_id: userId,
      },
    });

    if (existingSubscription) {
      // Unsubscribe the user
      const unSubscription = await prisma.subscriber.delete({
        where: {
          id: existingSubscription.id,
        },
      });

      return res
        .status(200)
        .json(ApiResponse.success(unSubscription, "Successfully unsubscribed from community"));
    } else {
      // Subscribe the user
      const subscription = await prisma.subscriber.create({
        data: {
          community_id: communityId,
          user_id: userId,
        },
      });

      return res
        .status(200)
        .json(ApiResponse.success(subscription, "Successfully subscribed to community"));
    }
  } catch (error) {
    console.error("Error in community subscription handling:", error);
    return res.status(500).json(ApiResponse.error("Internal server error"));
  }
}