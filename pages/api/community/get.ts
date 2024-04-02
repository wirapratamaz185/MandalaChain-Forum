import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { order, limit } = req.query;
    const communities = await prisma.community.findMany({
      take: Number(limit) || 5,
      orderBy: {
        numberOfMembers: order === "desc" ? "desc" : "asc",
      },
    });
    res.status(200).json(communities); // Send the communities as a response
  } catch (error) {
    console.error("Error fetching data", error);
    res.status(500).json({ error: "An error occurred while fetching the data" });
  } finally {
    prisma.$disconnect();
  }
}