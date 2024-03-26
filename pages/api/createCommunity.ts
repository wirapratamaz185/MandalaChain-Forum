import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("handle function called");

  const { communityName, communityType, creatorId } = req.body;

  try {
    const community = await prisma.community.create({
      data: {
        name: communityName,
        privacyType: communityType,
        creatorId,
        numberOfMembers: 0, // Add the numberOfMembers property with a default value
      },
    });
    console.log("Community created:", community);
    res.status(200).json({
      community,
    });
  } catch (error) {
    console.error("Error creating community:", error);
    res.status(500).json({ error: "An error occurred while creating the community" });
  }
}
