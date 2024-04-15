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

  let userId: string;
  try {
    const result = await MiddlewareAuthorization(req, secret!);
    if (typeof result !== "string") {
      throw new ApiError("Invalid user ID", 401);
    }
    userId = result;
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(ApiResponse.error(error.message));
    } else if (error instanceof Error) {
      return res.status(500).json(ApiResponse.error(error.message));
    } else {
      return res
        .status(500)
        .json(ApiResponse.error("An unknown error occurred"));
    }
  }

  try {
    const comments = await prisma.comment.findMany({
      where: {
        post_id: postId,
      },
      select: {
        id: true,
        text: true,
        created_at: true,
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res
      .status(200)
      .json(ApiResponse.success(comments, "Comments retrieved successfully"));
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error retrieving comments:", error);
      res.status(500).json(ApiResponse.error(error.message));
    } else {
      res.status(500).json(ApiResponse.error("An unknown error occurred"));
    }
  }
}
