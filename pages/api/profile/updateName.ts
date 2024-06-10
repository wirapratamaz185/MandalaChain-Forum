// src/pages/api/profile/updateName.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";
import { prisma } from "../../../prisma/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== "PUT") {
      throw new ApiError("Method not allowed", 405);
    }

    console.log("=====================================");
    console.log("handle function Update Username");
    console.log("=====================================");

    const result = await MiddlewareAuthorization(req, secret!);
    if (typeof result !== "string") {
      throw new ApiError("Invalid user ID", 401);
    }
    const userId = result;

    const { username } = req.body;
    if (!username) {
      throw new ApiError("Username is required", 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username },
      select: {
        id: true,
        username: true,
      },
    });

    res
      .status(200)
      .json(ApiResponse.success(updatedUser, "Username updated successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(ApiResponse.error(error.message));
    } else if (error instanceof Error) {
      res.status(500).json(ApiResponse.error(error.message));
    } else {
      res.status(500).json(ApiResponse.error("An unknown error occurred"));
    }
  }
};

export default handler;
