// pages/api/posts/getbyId.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";

const prisma = new PrismaClient();

export default async function GETID(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  console.log("=====================================");
  console.log("handle function Get Posts ID called");
  console.log("=====================================");

  // Extract communityId from the URL params
  const { postId } = req.query;

  if (!postId) {
    return res.status(400).json(ApiResponse.error("Post ID is required"));
  }

  let userId;
  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string") {
      throw new ApiError("Unauthorized: No userId decoded", 401);
    }
    userId = payload;

    const post = await prisma.post.findUnique({
      where: {
        id: postId as string,
      },
      select: {
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
    });

    if (!post) {
      return res.status(404).json(ApiResponse.error("Post not found"));
    }

    return res
      .status(200)
      .json(ApiResponse.success(post, "Post fetched successfully"));
  } catch (error) {
    console.error("Error fetching post by ID: ", error);
    return res
      .status(500)
      .json(ApiResponse.error("An error occurred while fetching post by ID"));
  }
}
