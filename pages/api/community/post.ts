import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import {ApiResponse} from '../../../utils/helper';
import jwt from 'jsonwebtoken';
import { secret } from "../../../utils/auth/secret";

const prisma = new PrismaClient();

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse
) : Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  console.log("=====================================")
  console.log("handle function called");
  console.log("req.body:", req.body);
  console.log("=====================================")

  const { name, communityType } = req.body;

  // Extract the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1] || '';

  // Verify and decode the token
  const decodedToken = jwt.verify(token, secret || '') as jwt.JwtPayload;
  console.log("decodedToken:", decodedToken);

  // get the user id from the decoded token
  const userId = decodedToken.id;

  try {
    const community = await prisma.community.create({
      data: {
        name,
        community_type: {
          create: {
            type: communityType,
          },
        },
        owner: {
          connect: {
            id: userId,
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
    console.log("Community created:", community);
    res.status(201).json(ApiResponse.success(community, "BASE.SUCCESS", undefined));
  } catch (error) {
    console.error("Error creating community:", error);
    res.status(500).json(ApiResponse.error("Internal Server Eror"));
  }
}