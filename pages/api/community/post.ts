import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) : Promise<void> {
  console.log("handle function called");

  const { communityType, creatorId } = req.body;

  // Generate a raw UUId and format it
  const rawUUID = uuidv4();
  const formattedUUID = rawUUID.replace(/-/g, "").substring(0, 28);

  try {
    const community = await prisma.community.create({
      data: {
        privacyType: communityType,
        creatorId: formattedUUID,
        numberOfMembers: 0, // Add the numberOfMembers property with a default value
      },
      select: {
        createdAt: true,
        creatorId: true,
        numberOfMembers: true,
        privacyType: true,
        id: true
      },
    });
    console.log("Community created:", community);
    return res.json({data: community})
  } catch (error) {
    console.error("Error creating community:", error);
    console.error("Stack trace:", (error as Error).stack);
    res.status(500).json({ error: "An error occurred while creating the community" });
  }
}
