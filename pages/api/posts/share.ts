import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";

const prisma = new PrismaClient();

export default async function SHARE(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  const { postId } = req.query;

  if (typeof postId !== 'string') {
    return res.status(400).json(ApiResponse.error("Post ID must be a string"));
  }

  let userId: string;
  try {
    const result = await MiddlewareAuthorization(req, secret!);
    if (typeof result !== 'string') {
      throw new ApiError("Invalid user ID", 401);
    }
    userId = result;
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(ApiResponse.error(error.message));
    } else if (error instanceof Error) {
      return res.status(500).json(ApiResponse.error(error.message));
    } else {
      return res.status(500).json(ApiResponse.error("An unknown error occurred"));
    }
  }

  try {
    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return res.status(404).json(ApiResponse.error("Post not found"));
    }

    // Generate a shareable link for the post
    // This is a placeholder for the actual link generation logic
    // You might want to use your domain and routing logic to create a shareable link
    const shareableLink = `http://localhost:3000/posts/${postId}`;
    
    // Return the shareable link
    res.status(200).json(ApiResponse.success({ shareableLink }, "Shareable link generated successfully"));
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error generating shareable link:", error);
      res.status(500).json(ApiResponse.error(error.message));
    } else {
      res.status(500).json(ApiResponse.error("An unknown error occurred"));
    }
  }
}