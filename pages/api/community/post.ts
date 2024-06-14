// pages/api/community/post.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { ApiError } from "../../../utils/response/baseError";
import { secret } from "../../../utils/auth/secret";
import { prisma } from "../../../prisma/prisma";

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  console.log("=====================================");
  console.log("handle function Post Community called");
  console.log("req.body:", req.body);
  console.log("=====================================");

  const { name, is_private } = req.body;

  // Validate is_private field
  if (typeof is_private !== "boolean") {
    return res.status(400).json(ApiResponse.error("Invalid community type"));
  }

  let userId: string;
  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string")
      throw new Error("Unauthorized: No userId decoded");
    userId = payload;

    const community = await prisma.community.create({
      data: {
        name,
        is_private,
        owner: {
          connect: {
            id: userId,
          },
        },
        subscribers: {
          create: {
            user: {
              connect: {
                id: userId,
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        is_private: true,
        owner: {
          select: {
            id: true,
          },
        },
      },
    });
    console.log("Community created:", community);
    res
      .status(201)
      .json(ApiResponse.success(community, "BASE.SUCCESS", undefined));
  } catch (error) {
    console.error("Error creating community:", error);
    if (error instanceof Error && error.message === "Unauthorized: No userId decoded") {
      return res.status(401).json(ApiResponse.error("Invalid token"));
    } else if (error instanceof ApiError) {
      return res.status(500).json(ApiResponse.error(error.message));
    } else {
      return res.status(500).json(ApiResponse.error("Unknown error occurred"));
    }
  }
}