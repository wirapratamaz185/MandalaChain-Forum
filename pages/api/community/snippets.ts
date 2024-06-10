import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { prisma } from "../../../prisma/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  console.log("=====================================");
  console.log("handle function Snippets called");
  console.log("=====================================");

  let userId: string;
  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string") {
      throw new Error("Unauthorized: No userId decoded");
    }
    userId = payload;

    const userSnippets = await prisma.subscriber.findMany({
      where: {
        user_id: userId,
      },
      include: {
        community: true,
      },
    });

    const snippets = userSnippets.map((snippet) => ({
      communityId: snippet.community.id,
      communityName: snippet.community.name,
      owner: snippet.community.owner_id,
    }));

    return res
      .status(200)
      .json(
        ApiResponse.success(snippets, "Successfully fetched user snippets")
      );
  } catch (error) {
    console.error("Error in fetching user snippets:", error);
    return res
      .status(500)
      .json(ApiResponse.error("Failed to fetch user snippets"));
  }
}