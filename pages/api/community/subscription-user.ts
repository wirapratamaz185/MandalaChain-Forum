// pages/api/community/subscription-user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { prisma } from "../../../prisma/prisma";

export default async function handleSubscriptionStatus(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
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
    const communities = await prisma.community.findMany({
      include: {
        subscribers: {
          where: {
            user_id: userId,
          },
        },
      },
    });

    const communityStatus = communities.map((community) => ({
      ...community,
      isSubscribed: community.subscribers.length > 0,
    }));

    return res
      .status(200)
      .json(ApiResponse.success(communityStatus, "Successfully fetched subscription status"));
  } catch (error) {
    console.error("Error in fetching subscription status:", error);
    return res.status(500).json(ApiResponse.error("Internal server error"));
  }
}