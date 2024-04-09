import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../utils/helper";
import jwt from "jsonwebtoken";
import { secret } from "../../../utils/auth/secret";

const prisma = new PrismaClient();

export default async function PATCH(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "PATCH") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  console.log("=====================================");
  console.log("handle function called");
  console.log("req.body:", req.body);
  console.log("=====================================");

  const { communityType } = req.body;
  const { communityId: communityId } = req.query;

  // Extract the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1] || "";

  // Verify and decode the token
  const decodedToken = jwt.verify(token, secret || "") as jwt.JwtPayload;
  console.log("decodedToken:", decodedToken);

  // get the user id from the decoded token
  const userId = decodedToken.id;

  try {
    const community = await prisma.community.findUnique({
      where: {
        id: communityId as string,
      },
      select: {
        owner_id: true,
      },
    });

    if (community?.owner_id !== userId) {
      return res
        .status(403)
        .json(
          ApiResponse.error(
            "You are not authorized to change the visibility of this community"
          )
        );
    }

    if (!community) {
      return res.status(404).json(ApiResponse.error("Community not found"));
    }

    const updatedCommunity = await prisma.community.update({
      where: {
        id: communityId as string,
      },
      data: {
        community_type: {
          update: {
            type: communityType,
          },
        },
      },
      select: {
        id: true,
        name: true,
        community_type: {
          select: {
            type: true,
          },
        },
        owner: {
          select: {
            id: true,
          },
        },
      },
    });

    res
      .status(200)
      .json(ApiResponse.success(updatedCommunity, "BASE.SUCCESS", undefined));
  } catch (error) {
    console.error("Error updating community:", error);
    res
      .status(500)
      .json(
        ApiResponse.error("Internal Server Error")
      );
  }
}
