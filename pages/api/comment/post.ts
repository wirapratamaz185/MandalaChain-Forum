// src/pages/api/comments/{postId}
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";

const prisma = new PrismaClient();

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
    const comment = await prisma.comment.create({
      data: {
        text,
        user: {
          connect: {
            id: userId,
          },
        },
        post: {
          connect: {
            id: postId,
          },
        },
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
    if (error instanceof Error) {
      console.error("Error creating comment:", error);
      res.status(500).json(ApiResponse.error(error.message));
    } else {
      res.status(500).json(ApiResponse.error("An unknown error occurred"));
    }
  }
}
