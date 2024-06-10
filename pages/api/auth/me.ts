// pages/api/auth/me.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { ApiResponse, MiddlewareAuthorization } from "@/utils/helper";
import { ApiError } from "@/utils/response/baseError";
import { secret } from "@/utils/auth/secret";
import { prisma } from "../../../prisma/prisma";

export default async function fetchUser(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  let userId: string;
  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string")
      throw new Error("Unauthorized: No userId decoded");
    const userId = payload;

    const user = await prisma.user.findUnique({
      where: {
        id: payload.toString(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        imageUrl: true,
      },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return res
      .status(200)
      .json(ApiResponse.success(user, "User fetched successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(ApiResponse.error(error.message));
    } else {
      return res.status(500).json(ApiResponse.error("Internal Server Error"));
    }
  }
}
