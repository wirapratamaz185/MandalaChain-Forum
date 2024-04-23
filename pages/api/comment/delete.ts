// src/pages/api/comments/{commentId}
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";

const prisma = new PrismaClient();

export default async function DELETE_COMMENT(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {git push -u origin revamp
  if (req.method !== "DELETE") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  const { commentId } = req.query;

  if (typeof commentId !== "string") {
    return res
      .status(400)
      .json(ApiResponse.error("Comment ID must be a string"));
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
    // Check if the comment exists and belongs to the user
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      return res.status(404).json(ApiResponse.error("Comment not found"));
    }

    if (comment.user_id !== userId) {
      return res
        .status(403)
        .json(ApiResponse.error("You can only delete your own comments"));
    }

    // Delete the comment
    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    res
      .status(200)
      .json(ApiResponse.success(null, "Comment deleted successfully"));
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting comment:", error);
      res.status(500).json(ApiResponse.error(error.message));
    } else {
      res.status(500).json(ApiResponse.error("An unknown error occurred"));
    }
  }
}
