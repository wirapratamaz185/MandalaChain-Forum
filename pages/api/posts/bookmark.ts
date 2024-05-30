//pages/api/posts/bookmark.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";

const prisma = new PrismaClient();

export default async function bookmark(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  console.log("=====================================");
  console.log("handle function Bookmark");
  console.log("=====================================");

  let userId;
  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string") {
      throw new ApiError("Unauthorized: No userId decoded", 401);
    }
    userId = payload;

    console.log("Authenticated user ID:", userId);

    const { postId } = req.query;

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: {
        id: postId as string,
      },
    });

    if (!post) {
      return res.status(404).json(ApiResponse.error("Post not found"));
    }

    // check if the bookmark already exists
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        post_id: post.id,
        user_id: userId,
      },
    });

    if (existingBookmark) {
      // if the bookmark exists, delete it (unbookmark)S
      await prisma.bookmark.delete({
        where: {
          id: existingBookmark.id,
        },
      });
      return res
        .status(200)
        .json(ApiResponse.success({}, "Unbookmark Post successfully"));
    } else {
      const bookmark = await prisma.bookmark.create({
        data: {
          user_id: userId,
          post_id: post.id,
        },
      });
      return res
        .status(200)
        .json(ApiResponse.success(bookmark, "Bookmark Post successfully"));
    }
  } catch (error) {
    console.error("Failed to bookmark post:", error);
    res
      .status(500)
      .json(ApiResponse.error("Failed to bookmark post due to an error"));
  }
}
