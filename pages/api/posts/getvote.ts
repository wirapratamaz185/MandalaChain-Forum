// api/posts/getvote.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";

const prisma = new PrismaClient();

export default async function getVotes(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }
  console.log("=====================================");
  console.log("handle function getVotes called");
  console.log("=====================================");

  const postId = req.query.id as string;

  let userId;
  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string") {
      throw new ApiError("Unauthorized: No userId decoded", 401);
    }
    userId = payload;
    console.log("Authenticated user ID:", userId);

    const votes = await prisma.post.findMany({
      where: {
        id: postId,
      },
      select: {
        vote: true,
      },
    });

    console.log("Votes fetched:", votes.length);

    if (votes.length === 0) {
      console.log("No votes available to display");
      return res.status(404).json(ApiResponse.error("No votes available"));
    }

    res
      .status(200)
      .json(ApiResponse.success(votes, "Votes fetched successfully"));
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching votes:", error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }
}
