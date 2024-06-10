// pages/api/posts/bookmarked.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { prisma } from "../../../prisma/prisma";

export default async function getBookmarkedPosts(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string") {
      return res.status(401).json(ApiResponse.error("Unauthorized"));
    }
    const userId = payload;

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        user_id: userId,
      },
      select: {
        post_id: true,
      },
    });

    const bookmarkedPostIds = bookmarks.map((bookmark) => bookmark.post_id);

    res.status(200).json(ApiResponse.success(bookmarkedPostIds, "Bookmarked posts fetched successfully"));
  } catch (error) {
    console.error("Failed to fetch bookmarked posts:", error);
    res.status(500).json(ApiResponse.error("An unknown error occurred"));
  }
}