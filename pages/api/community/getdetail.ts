import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../utils/helper";

const prisma = new PrismaClient();

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  const { communityId } = req.query;

  try {
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
