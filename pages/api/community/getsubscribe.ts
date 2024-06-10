// pages/api/community/getsubscribe.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { prisma } from "../../../prisma/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  console.log("=====================================");
  console.log("handle function Get Subscribe User");
  console.log("=====================================");

  let userId: string;
  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string") {
      throw new Error("Unauthorized: No userId decoded");
    }
    userId = payload;

    const subscriptions = await prisma.subscriber.findMany({
      where: {
        user_id: userId,
      },
      include: {
        community: true, // Include the community details
      },
    });

    const response = subscriptions.map((subscription) => ({
      communityId: subscription.community_id,
      communityName: subscription.community.name,
    }));

    return res
      .status(200)
      .json(
        ApiResponse.success(
          response,
          "Successfully retrieved subscribed communities"
        )
      );
  } catch (error) {
    console.error("Error in getsubscribe:", error);
    return res.status(500).json(ApiResponse.error("Internal Server Error"));
  }
}