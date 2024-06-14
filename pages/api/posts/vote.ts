// api/posts/vote.ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  ApiResponse,
  MiddlewareAuthorization,
  validator,
} from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";
import { VoteValidator } from "../../../utils/schema";
import { z } from "zod";
import { prisma } from "../../../prisma/prisma";

type ErrorResponseZod = {
  code: string;
  expected: string;
  received: string;
  path: string[];
  message: string;
};

export default async function VOTE(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  console.log("=====================================");
  console.log("handle function VOTE called");
  console.log("Request Body:", req.body);
  console.log("=====================================");

  const postId = req.query.postId as string;

  try {
    // Validate request body
    const bodyReq = await validator.validate(VoteValidator, req.body);
    const { up } = bodyReq;

    if (typeof up !== "boolean") {
      return res.status(400).json(ApiResponse.error("Invalid vote status"));
    }

    // Authenticate user
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string") {
      throw new ApiError("Unauthorized: No userId decoded", 401);
    }
    const userId = payload;

    // Check if the user has already voted on this post
    const existingVote = await prisma.vote.findUnique({
      where: {
        user_id_post_id: {
          user_id: userId,
          post_id: postId,
        },
      },
    });

    if (existingVote) {
      // If user already voted, toggle the vote
      if (existingVote.up === up) {
        // Remove the vote if the same vote is cast again
        await prisma.vote.delete({
          where: {
            user_id_post_id: {
              user_id: userId,
              post_id: postId,
            },
          },
        });

        // Update the vote count on the post
        await prisma.post.update({
          where: { id: postId },
          data: {
            vote: {
              decrement: up ? 1 : -1,
            },
          },
        });

        return res
          .status(200)
          .json(ApiResponse.success(null, "Vote removed successfully"));
      } else {
        // Update the vote if user changes from upvote to downvote or vice versa
        await prisma.vote.update({
          where: {
            user_id_post_id: {
              user_id: userId,
              post_id: postId,
            },
          },
          data: { up },
        });

        // Update the vote count on the post
        await prisma.post.update({
          where: { id: postId },
          data: {
            vote: {
              increment: up ? 2 : -2,
            },
          },
        });

        return res
          .status(200)
          .json(ApiResponse.success(null, "Vote updated successfully"));
      }
    } else {
      // If user has not voted, add the vote
      await prisma.vote.create({
        data: {
          user_id: userId,
          post_id: postId,
          up,
        },
      });

      // Update the vote count on the post
      await prisma.post.update({
        where: { id: postId },
        data: {
          vote: {
            increment: up ? 1 : -1,
          },
        },
      });

      return res
        .status(200)
        .json(ApiResponse.success(null, "Vote added successfully"));
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.message;
      const errorParsing = JSON.parse(
        JSON.stringify(errors[0])
      ) as ErrorResponseZod[];
      console.log(errorParsing);
      return res.status(400).json(ApiResponse.error(error.message));
    }
    if (error instanceof Error) {
      return res.status(500).json(ApiResponse.error(error.message));
    }
  }
}