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
): Promise<void> {
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
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string")
      throw new Error("Unauthorized: No userId decoded");
    const userId = payload;

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

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    return res
      .status(200)
      .json(ApiResponse.success(null, "Comment deleted successfully"));
  } catch (error) {
    console.error("Error processing delete comment:", error);
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(ApiResponse.error(error.message));
    }
    return res
      .status(500)
      .json(ApiResponse.error("An internal server error occurred"));
  }
}
