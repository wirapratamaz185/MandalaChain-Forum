//pages/api/posts/generic.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";

const prisma = new PrismaClient();

export default async function getGeneric(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  // console.log("=====================================");
  // console.log("handle function Generic Public called");
  // console.log("=====================================");

  let userId;
  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string") {
      throw new ApiError("Unauthorized: No userId decoded", 401);
    }
    userId = payload;

    console.log("Authenticated user ID:", userId);

    const posts = await prisma.post.findMany({
      where: {
        community: {
          community_type: {
            type: "PUBLIC",
          },
        },
      },
      orderBy: [
        {
          vote: "desc",
        },
        {
          created_at: "desc",
        },
      ],
      include: {
        user: {
          select: {
            username: true,
          },
        },
        community: {
          select: {
            name: true,
          },
        },
      },
      take: 5,
    });

    if (posts.length === 0) {
      console.log("No posts available to display");
      return res.status(404).json(ApiResponse.error("No posts available"));
    }

    // console.log("Fetched ${posts.length} posts successfully");
    res
      .status(200)
      .json(
        ApiResponse.success(posts, "Generic public posts fetched successfully")
      );
  } catch (error) {
    console.error("Failed to fetch generic posts:", error);
    res
      .status(500)
      .json(ApiResponse.error("Failed to fetch the generic home feed"));
  }
}
