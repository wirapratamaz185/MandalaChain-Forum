import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";

const prisma = new PrismaClient();

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "DELETE") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  console.log("=====================================");
  console.log("handle function called");
  console.log("=====================================");

  const { postId } = req.query;

  if (typeof postId !== 'string') {
    return res.status(400).json(ApiResponse.error("Post ID must be a string"));
  }

  let userId: string;
  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string") {
      throw new ApiError("Unauthorized: No userId decoded", 401);
    }
    userId = payload;
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return res.status(404).json(ApiResponse.error("Post not found"));
    }

    if (post.user_id !== userId) {
      return res.status(403).json(ApiResponse.error("You are not authorized to delete this post"));
    }

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    res.status(200).json(ApiResponse.success(null, "Post deleted successfully"));
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting post:", error);
      res.status(500).json(ApiResponse.error(error.message));
    } else {
      res.status(500).json(ApiResponse.error("An unknown error occurred"));
    }
  }
}