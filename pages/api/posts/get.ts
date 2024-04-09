import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../utils/helper";
import jwt from "jsonwebtoken";
import { secret } from "../../../utils/auth/secret";

const prisma = new PrismaClient();

export default async function GET(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  // Extract communityId from the URL params
  const { communityId } = req.query;

  console.log("=====================================");
  console.log("Create post function called");
  console.log("communityId:", communityId);
  console.log("=====================================");

  // Extract the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1] || "";

  // Verify and decode the token
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, secret || "") as jwt.JwtPayload;
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
    const posts = await prisma.post.findMany({
      where: {
        community_id: communityId as string,
      },
      select: {
        community: {
          select: {
            id: true,
            name: true,
          },
        },
        id: true,
        title: true,
        body: true,
        imageUrl: true,
        vote: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Map each post to a new object with a cleaner structure
  const cleanedPosts = posts.map(post => ({
    id: post.id,
    title: post.title,
    body: post.body,
    imageUrl: post.imageUrl,
    vote: post.vote,
    createdAt: post.created_at,
    user: {
      id: post.user.id,
      username: post.user.username,
    },
    community: {
      id: post.community.id,
      name: post.community.name,
    },
  }));

    res.status(200).json(ApiResponse.success(cleanedPosts, "BASE.SUCCESS", undefined));
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).json(ApiResponse.error("Internal Server Error"));
  }
}
