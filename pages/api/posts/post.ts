// src/pages/api/posts/post.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";
import uploadFormFiles from "../upload";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json(ApiResponse.error("Method not allowed"));
  }

  const { communityId } = req.query;

  if (typeof communityId !== 'string') {
    return res.status(400).json(ApiResponse.error("Community ID must be a string"));
  }

  let userId: string;
  try {
    const result = await MiddlewareAuthorization(req, secret!);
    if (typeof result !== 'string') {
      throw new ApiError("Invalid user ID", 401);
    }
    userId = result;
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(ApiResponse.error(error.message));
    } else if (error instanceof Error) {
      return res.status(500).json(ApiResponse.error(error.message));
    } else {
      return res.status(500).json(ApiResponse.error("An unknown error occurred"));
    }
  }

  try {
    // Wait for the file upload to complete
    const { fields, files } = await uploadFormFiles(req);

    // Extract the title and body fields
    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
    const body = Array.isArray(fields.body) ? fields.body[0] : fields.body;

    console.log("Title:", title);
    console.log("Body:", body);

    // Assuming 'file' is the key for the uploaded file
    const file = files.file;
    console.log("File:", file);
    const imageUrl = file ? file.filePath : null;

    // console.log("File Upload:", file)
    console.log("Image URL Upload Success:", imageUrl);

    const post = await prisma.post.create({
      data: {
        title,
        body,
        imageUrl,
        vote: 0,
        user: {
          connect: {
            id: userId,
          },
        },
        community: {
          connect: {
            id: communityId,
          },
        },
      },
      select: {
        id: true,
        title: true,
        body: true,
        imageUrl: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    res.status(201).json(ApiResponse.success(post, "Post created successfully"));
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating post:", error);
      res.status(500).json(ApiResponse.error(error.message));
    } else {
      res.status(500).json(ApiResponse.error("An unknown error occurred"));
    }
  }
}