import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";
import { prisma } from "../../../prisma/prisma";

export default async function SUBSCRIBED_POSTS(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  let userId: string;
  try {
    const result = await MiddlewareAuthorization(req, secret!);
    if (typeof result !== 'string') {
      throw new ApiError("Invalid user ID", 401);
    }
    userId = result;
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(ApiResponse.error(error.message));
    } else if (error instanceof Error) {
      return res.status(500).json(ApiResponse.error(error.message));
    } else {
      return res.status(500).json(ApiResponse.error("An unknown error occurred"));
    }
  }

  try {
    // Find the communities the user is subscribed to
    const subscribedCommunities = await prisma.subscriber.findMany({
      where: {
        user_id: userId,
      },
      select: {
        community_id: true,
      },
    });

    // Extract the community IDs
    const communityIds = subscribedCommunities.map(sub => sub.community_id);

    // Find the posts from these communities
    const posts = await prisma.post.findMany({
      where: {
        community_id: {
          in: communityIds,
        },
      },
      select: {
        id: true,
        title: true,
        body: true,
        imageUrl: true,
        vote: true,
        created_at: true,
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.status(200).json(ApiResponse.success(posts, "Posts retrieved successfully"));
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error retrieving subscribed posts:", error);
      res.status(500).json(ApiResponse.error(error.message));
    } else {
      res.status(500).json(ApiResponse.error("An unknown error occurred"));
    }
  }
}