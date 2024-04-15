import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";

const prisma = new PrismaClient();

export default async function PATCH(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "PATCH") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  const { username, imageUrl } = req.body;

  let userId: string;
  try {
    const result = await MiddlewareAuthorization(req, secret!);
    if (typeof result !== "string") {
      throw new ApiError("Invalid user ID", 401);
    }
    userId = result;
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(ApiResponse.error(error.message));
    } else if (error instanceof Error) {
      return res.status(500).json(ApiResponse.error(error.message));
    } else {
      return res
        .status(500)
        .json(ApiResponse.error("An unknown error occurred"));
    }
  }

  try {
    // Update the user's profile
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username: username,
        imageUrl: imageUrl,
      },
      select: {
        id: true,
        username: true,
        imageUrl: true,
      },
    });
    res
      .status(200)
      .json(ApiResponse.success(updatedUser, "Profile updated successfully"));
  } catch (error) {
    if (error) {
      console.error("Known error updating user profile:", error);
      res
        .status(500)
        .json(
          ApiResponse.error("A known error occurred while updating the profile")
        );
    } else {
      // Handle unknown errors
      res
        .status(500)
        .json(
          ApiResponse.error(
            "An unknown error occurred while updating the profile"
          )
        );
    }
  }
}
