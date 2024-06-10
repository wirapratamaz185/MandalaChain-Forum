// pages/api/community/getdetail.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { ApiError } from "../../../utils/response/baseError";
import { secret } from "../../../utils/auth/secret";
import { prisma } from "../../../prisma/prisma";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  console.log("=====================================");
  console.log("handle function Get Community Detail called");
  console.log("=====================================");

  let userId: string;

  const { communityId } = req.query;
  console.log("Received communityId: ", communityId);

  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string")
      throw new Error("Unauthorized: No userId decoded");
    userId = payload;

    const community = await prisma.community.findUnique({
      where: {
        id: communityId as string,
      },
      include: {
        community_type: true,
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        posts: {
          where: {
            community_id: communityId as string, // Ensure posts are filtered by communityId
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
            comments: {
              include: {
                user: true, // Include the user who created the comment
              },
            },
            Bookmark: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
        subscribers: {
          include: {
            user: true, // Include the user who subscribed to the community
          },
        },
      },
    });

    if (!community) {
      console.log("No Community found for ID: ", communityId as string)
      return res.status(404).json(ApiResponse.error("Community not found"));
    }

    res
      .status(200)
      .json(ApiResponse.success(community, "BASE.SUCCESS", undefined));
  } catch (error) {
    console.error("Error fetching community:", error);
    res
      .status(500)
      .json(
        ApiResponse.error("An error occurred while fetching the community")
      );
  }
}