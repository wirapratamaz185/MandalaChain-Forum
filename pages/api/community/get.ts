// pages/api/community/get.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";

const prisma = new PrismaClient();

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  try {
    if (!secret) {
      throw new ApiError("Secret is undefined", 500);
    }
    const userId = await MiddlewareAuthorization(req, secret);
    console.log("==================================");
    console.log("Authenticated User ID", userId);
    console.log("==================================");

    const { order, limit } = req.query;
    
    let communities = await prisma.community.findMany({
      include: {
        community_type: true,
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        subscribers: true,
        posts: true,
      },
      orderBy: {
        created_at: order === "asc" ? "asc" : "desc",
      },
      take: limit ? Number(limit) : undefined,
    });
    
    // Ensure communities is always an array
    if (!Array.isArray(communities)) {
      communities = [];
    }
    
    const totalCommunities = communities.length;

    return res
      .status(200)
      .json(
        ApiResponse.success(
          { communities, totalCommunities },
          "Communities fetched successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(ApiResponse.error(error.message));
    } else if (error instanceof Error) {
      console.error("Error fetching data", error);
      return res.status(500).json(ApiResponse.error("Internal Server Error"));
    } else {
      console.error("An unknown error occurred", error);
      return res
        .status(500)
        .json(ApiResponse.error("An unknown error occurred"));
    }
  }
}
