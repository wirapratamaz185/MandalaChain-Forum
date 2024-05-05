// api/posts/vote.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";

const prisma = new PrismaClient();

export default async function VOTE(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }
  console.log("=====================================");
  console.log("handle function called");
  console.log("Request Body:", req.body);
  console.log("=====================================");

  const postId = req.query.id as string;
  const { vote } = req.body; // Expecting vote to be either 1 (upvote) or -1 (downvote)

  if (![1, -1].includes(vote)) {
    return res.status(400).json(ApiResponse.error("Invalid vote value"));
  }

  let userId: string;
  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string") {
      throw new ApiError("Unauthorized: No userId decoded", 401);
    }
    userId = payload;
    // Update the vote count by incrementing or decrementing based on the vote value
    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: vote === 1 ? {
        vote: {
          increment: 1,
        },
      } : {
        vote: {
          decrement: 1,
        },
      },
      select: {
        id: true,
        vote: true,
      },
    });

    res.status(200).json(ApiResponse.success(updatedPost, "Vote updated successfully"));
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating vote:", error);
      res.status(500).json(ApiResponse.error(error.message));
    } else {
      res.status(500).json(ApiResponse.error("An unknown error occurred"));
    }
  }
}