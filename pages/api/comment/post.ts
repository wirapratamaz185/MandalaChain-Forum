// src/pages/api/comments/{postId}
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";
import { prisma } from "../../../prisma/prisma";

export default async function COMMENT(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  const { postId } = req.query;
  if (typeof postId !== "string") {
    return res.status(400).json(ApiResponse.error("Post ID must be a string"));
  }

  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res
      .status(400)
      .json(ApiResponse.error("Text is required and must be a string"));
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

    const comment = await prisma.comment.create({
      data: {
        text,
        user: { connect: { id: userId } },
        post: { connect: { id: postId } },
      },
      select: {
        id: true,
        text: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res
      .status(201)
      .json(ApiResponse.success(comment, "Comment created successfully"));
  } catch (error) {
    console.error("Error processing comment:", error);
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(ApiResponse.error(error.message));
    } else if (error instanceof Error) {
      return res
        .status(500)
        .json(ApiResponse.error(error.message || "Unknown error"));
    } else {
      return res.status(500).json(ApiResponse.error("Unknown error occurred"));
    }
  }
}
