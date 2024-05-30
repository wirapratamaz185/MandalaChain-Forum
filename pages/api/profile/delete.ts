// src/pages/api/profile/delete.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== "DELETE") {
      throw new ApiError("Method not allowed", 405);
    }

    console.log("=====================================");
    console.log("handle function Delete Image");
    console.log("=====================================");

    const result = await MiddlewareAuthorization(req, secret!);
    if (typeof result !== "string") {
      throw new ApiError("Invalid user ID", 401);
    }
    const userId = result;

    // Fetch the user's current image URL
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { imageUrl: true },
    });

    if (!user || !user.imageUrl) {
      throw new ApiError("No image to delete", 400);
    }

    // Update the user profile to remove the image URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { imageUrl: null },
      select: {
        id: true,
        username: true,
        imageUrl: true,
      },
    });

    res
      .status(200)
      .json(
        ApiResponse.success(
          updatedUser,
          "Profile image URL removed successfully"
        )
      );
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
