// src/pages/api/comments/[postId]
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";

const prisma = new PrismaClient();

export default async function GET_COMMENTS(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  const { postId } = req.query;
  if (typeof postId !== "string") {
    return res.status(400).json(ApiResponse.error("Post ID must be a string"));
  }
  if (postId.length === 0) {
    return res.status(400).json(ApiResponse.error("Post ID is required"));
  }

  let userId: string;
  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string")
      throw new Error("Unauthorized: No userId decoded");
    const userId = payload;

    // check if the post exists
    const post = await prisma.post.findFirst({
      where: { id: postId },
    });
    if (!post) {
      return res.status(404).json(ApiResponse.error("Post not found"));
    }

    const comments = await prisma.comment.findMany({
      where: { post_id: postId },
      include: {
        user: {
          select: { id: true, username: true, imageUrl: true },
        },
      },
      orderBy: { created_at: "asc" },
    });

    res
      .status(200)
      .json(ApiResponse.success(comments, "Comments retrieved successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("Error retrieving comments:", error);
      res.status(500).json(ApiResponse.error(error.message));
    } else {
      res.status(500).json(ApiResponse.error("An unknown error occurred"));
    }
  }
}
