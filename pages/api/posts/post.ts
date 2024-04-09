import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../utils/helper";
import jwt from "jsonwebtoken";
import { secret } from "../../../utils/auth/secret";

const prisma = new PrismaClient();

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  // Extract communityId from the URL params
  const { communityId } = req.query;

  console.log("=====================================");
  console.log("Create post function called");
  console.log("req.body:", req.body);
  console.log("communityId:", communityId);
  console.log("=====================================");

  const { title, body, imageUrl } = req.body;

  // Extract the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1] || '';

  // Verify and decode the token
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, secret || '') as jwt.JwtPayload;
  } catch (error) {
    return res.status(401).json(ApiResponse.error("Invalid or expired token"));
  }

  console.log("decodedToken:", decodedToken);

  // Get the user id from the decoded token
  const userId = decodedToken.id;

  if (!communityId) {
    return res.status(400).json(ApiResponse.error("Community ID is required"));
  }

  try {
    const post = await prisma.post.create({
      data: {
        title,
        body,
        imageUrl, // This is optional, so it's okay if it's undefined
        vote: 0,
        user: {
          connect: {
            id: userId,
          },
        },
        community: {
          connect: {
            id: communityId as string, // Cast to string because req.query params are of type string | string[]
          },
        },
      },
      select: {
        id: true,
        title: true,
        body: true,
        imageUrl: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    console.log("Post created:", post);
    res.status(201).json(ApiResponse.success(post, "BASE.SUCCESS", undefined));
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json(ApiResponse.error("Internal Server Error"));
  }
}