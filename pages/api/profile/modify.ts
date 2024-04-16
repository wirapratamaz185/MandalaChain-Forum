// src/pages/api/profile/modify.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";
import uploadForm from "../upload";

const prisma = new PrismaClient();

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

    const { fields, files } = req.body;
    const file = files.file;
    const imageUrl = file ? file.filepath : null;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: fields.username,
        ...(imageUrl && { imageUrl }),
      },
    });

    res
      .status(200)
      .json(ApiResponse.success(updatedUser, "Profile updated successfully"));
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

export default uploadForm;
