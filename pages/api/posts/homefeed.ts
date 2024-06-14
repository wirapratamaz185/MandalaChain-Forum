// pages/api/posts/homefeed.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";
import { prisma } from "../../../prisma/prisma";

export default async function getGeneric(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }
  console.log("=====================================");
  console.log("handle function Home Feed called");
  console.log("=====================================");

  let userId;
  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string") {
      throw new ApiError("Unauthorized: No userId decoded", 401);
    }
    userId = payload;
    // console.log("Authenticated user ID:", userId);

    let posts;
    if (userId) {
      const subscriptions = await prisma.subscriber.findMany({
        where: { user_id: userId as string },
        include: { community: { include: { posts: true } } },
      });

      console.log("Subscriptions fetched:", subscriptions.length);
      posts = subscriptions.flatMap((sub) => sub.community.posts);
      console.log("posts fetched from subscription", posts.length);
    } else {
      // fetch generic feed posts from public communities
      posts = await prisma.post.findMany({
        where: {
          community: {
            is_private: false,
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });
      console.log("Generic public posts fetched:", posts.length);
    }

    if (posts.length === 0) {
      console.log("No posts available to display");
      return res.status(404).json(ApiResponse.error("No posts available"));
    }

    res
      .status(200)
      .json(ApiResponse.success(posts, "Home feed fetched successfully"));
  } catch (error) {
    console.error("Failed to fetch generic posts:", error);
    res.status(500).json(ApiResponse.error("Failed to fetch home feed"));
  }
}