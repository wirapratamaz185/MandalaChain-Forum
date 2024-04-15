import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";

const prisma = new PrismaClient();

export default async function GET(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  // Extract communityId from the URL params
  const { communityId } = req.query;

  if (!communityId) {
    return res.status(400).json(ApiResponse.error("Community ID is required"));
  }

  let userId;
  try {
    // Ensure secret is defined before calling MiddlewareAuthorization
    if (!secret) {
      throw new ApiError("Secret is undefined", 500);
    }
    userId = await MiddlewareAuthorization(req, secret);
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(ApiResponse.error(error.message));
    }
    return res.status(500).json(ApiResponse.error("An unknown error occurred"));
  }

  try {
    const posts = await prisma.post.findMany({
      where: {
        community_id: communityId as string,
      },
      select: {
        community: {
          select: {
            id: true,
            name: true,
          },
        },
        id: true,
        title: true,
        body: true,
        imageUrl: true,
        vote: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Map each post to a new object with a cleaner structure
    const cleanedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      body: post.body,
      imageUrl: post.imageUrl,
      vote: post.vote,
      createdAt: post.created_at,
      user: {
        id: post.user.id,
        username: post.user.username,
      },
      community: {
        id: post.community.id,
        name: post.community.name,
      },
    }));

    res
      .status(200)
      .json(ApiResponse.success(cleanedPosts, "Post fetch successfully"));
  } catch (error) {
    res.status(500).json(ApiResponse.error("An unknown error occurred"));
  }
}
