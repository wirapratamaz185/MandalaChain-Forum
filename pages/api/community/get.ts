import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../utils/helper";

const prisma = new PrismaClient();

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }
  try {
    const { order, limit } = req.query;
    const communities = await prisma.community.findMany({
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

    const totalCommunities = communities.length;

    res
      .status(200)
      .json(ApiResponse.success({ communities, totalCommunities }));
  } catch (error) {
    console.error("Error fetching data", error);
    res.status(500).json(ApiResponse.error("Internal Server Error"));
  } finally {
    prisma.$disconnect();
  }
}
