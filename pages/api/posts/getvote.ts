// api/posts/getvote.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";
import { prisma } from "../../../prisma/prisma";

export default async function getVotes(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  const postId = req.query.postId as string;

  let userId;
  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string") {
      throw new ApiError("Unauthorized: No userId decoded", 401);
    }
    userId = payload;

    const postWithVotes = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        title: true,
        body: true,
        vote: true,
        Vote: {
          where: {
            user_id: userId,
          },
          select: {
            up: true,
          },
        },
      },
    });

    if (!postWithVotes) {
      return res.status(404).json(ApiResponse.error("No votes available"));
    }

    const response = {
      id: postWithVotes.id,
      title: postWithVotes.title,
      body: postWithVotes.body,
      vote: postWithVotes.vote,
      userVote: postWithVotes.Vote.length > 0 ? postWithVotes.Vote[0].up : null,
    };

    res
      .status(200)
      .json(ApiResponse.success(response, "Votes fetched successfully"));
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching votes:", error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }
}