// src/pages/api/profile/modify.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";
import uploadFormFiles from "../upload";
import { v4 as uuidv4 } from 'uuid';
import { prisma } from "../../../prisma/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== "PATCH") {
      throw new ApiError("Method not allowed", 405);
    }

    const result = await MiddlewareAuthorization(req, secret!);
    if (typeof result !== "string") {
      throw new ApiError("Invalid user ID", 401);
    }
    const userId = result;

    // Wait for the file upload to complete
    const { fields, files } = await uploadFormFiles(req);

    // Assuming 'file' is the key for the uploaded file
    const fileKey = Object.keys(files)[0];
    const imageUrl = fileKey ? files[fileKey] : null;

    // Update the user profile with the new image URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(imageUrl && { imageUrl }),
      },
      select: {
        id: true,
        username: true,
        imageUrl: true,
      },
    });

    res.status(200).json(ApiResponse.success(updatedUser, "Profile image updated successfully"));
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