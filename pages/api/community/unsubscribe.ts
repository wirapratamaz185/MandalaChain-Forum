import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
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
  console.log("=====================================");

  const { communityId: communityId } = req.query;

  let userId: string;
  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string") {
      throw new Error("Unauthorized: No userId decoded");
    }
    userId = payload;
    const subscription = await prisma.subscriber.findFirst({
      where: {
        community_id: communityId as string,
        user_id: userId,
      },
    });

    if (!subscription) {
      return res
        .status(400)
        .json(ApiResponse.error("You are not subscribed to this community"));
    }

    const unSubscription = await prisma.subscriber.delete({
      where: {
        id: subscription.id,
      },
    });

    return res
      .status(200)
      .json(ApiResponse.success(unSubscription, "Successfully unsubscribed to community"));
  } catch (error) {
    console.error("Error in community unsubscribe:", error);
    return res.status(500).json(ApiResponse.error("Internal server error"));
  }
}
