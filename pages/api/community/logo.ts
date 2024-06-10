// src/pages/api/community/logo.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";
import uploadFormFiles from "../upload";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../../prisma/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let userId;
  try {
    const payload = await MiddlewareAuthorization(req, secret as string);
    if (!payload || typeof payload !== "string") throw new Error("Unauthorized: No userId decoded");
    userId = payload;
  } catch (error) {
    return res.status(500).json(ApiResponse.error("An unknown error occurred while authenticating"));
  }

  const { communityId } = req.query;

  if (req.method === "PATCH") {
    try {
      const community = await prisma.community.findUnique({
        where: {
          id: communityId as string,
        },
        select: {
          owner_id: true,
          imageUrl: true,
        },
      });

      // Check if the community exists
      if (!community) {
        return res.status(404).json(ApiResponse.error("Community not found"));
      }

      // Check if the user is the owner of the community
      if (community.owner_id !== userId) {
        return res
          .status(403)
          .json(
            ApiResponse.error(
              "You are not authorized to change the community logo"
            )
          );
      }

      const { files } = await uploadFormFiles(req);
      const file = files.image ? files.image[0] : null;

      // console.log(file, "file:");

      if (!file) {
        return res.status(400).json(ApiResponse.error("No image uploaded"));
      }

      // Generate a unique filename for the uploaded image
      const newFilename = `${uuidv4()}_${file.originalFilename}`;
      const imageUrl = `/upload/${newFilename}`; // This should be the path or URL to access the image

      const updatedCommunity = await prisma.community.update({
        where: {
          id: communityId as string,
        },
        data: {
          imageUrl: imageUrl,
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          owner: {
            select: {
              id: true,
            },
          },
        },
      });

      res
        .status(200)
        .json(
          ApiResponse.success(
            updatedCommunity,
            "Community logo updated successfully"
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
  } else if (req.method === "DELETE") {
    try {
      const community = await prisma.community.findUnique({
        where: {
          id: communityId as string,
        },
        select: {
          owner_id: true,
          imageUrl: true,
        },
      });

      if (!community) {
        return res.status(404).json(ApiResponse.error("Community not found"));
      }

      if (community.owner_id !== userId) {
        return res
          .status(403)
          .json(
            ApiResponse.error(
              "You are not authorized to delete the community logo"
            )
          );
      }

      // Check if the community already has no logo
      if (community.imageUrl === null) {
        return res.status(400).json(ApiResponse.error("No logo to delete"));
      }

      const updatedCommunity = await prisma.community.update({
        where: {
          id: communityId as string,
        },
        data: {
          imageUrl: null,
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          owner: {
            select: {
              id: true,
            },
          },
        },
      });

      res
        .status(200)
        .json(
          ApiResponse.success(
            updatedCommunity,
            "Community logo deleted successfully"
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
  } else {
    res
      .status(405)
      .json(ApiResponse.error(`Method '${req.method}' Not Allowed`));
  }
};

export default handler;
