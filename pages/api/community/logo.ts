
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse } from "../../../utils/helper";
import jwt from "jsonwebtoken";
import { secret } from "../../../utils/auth/secret";
import multer from 'multer';
import nextConnect from 'next-connect';

const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
});

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

// Add the middleware to handle file upload
apiRoute.use(upload.single('image'));

apiRoute.patch(async (req, res) => {
  const { communityId } = req.query;
  const token = req.headers.authorization?.split(" ")[1] || "";
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, secret || "");
  } catch (error) {
    return res.status(401).json(ApiResponse.error("Invalid or expired token"));
  }

  const userId = decodedToken.id;

  try {
    const community = await prisma.community.findUnique({
      where: {
        id: communityId as string,
      },
      select: {
        owner_id: true,
      },
    });

    if (!community) {
      return res.status(404).json(ApiResponse.error("Community not found"));
    }

    if (community.owner_id !== userId) {
      return res.status(403).json(ApiResponse.error("You are not authorized to change the community logo"));
    }

    // Check if an image was uploaded
    if (!req.file) {
      return res.status(400).json(ApiResponse.error("No image uploaded"));
    }

    // Here you would handle the file upload to your cloud storage and get the URL
    // For example, using a function like `uploadImage(req.file.buffer)`
    const imageUrl = await uploadImage(req.file.buffer);

    const updatedCommunity = await prisma.community.update({
      where: {
        id: communityId as string,
      },
      data: {
        imageUrl: imageUrl, // Update the imageUrl field with the new image URL
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

    res.status(200).json(ApiResponse.success(updatedCommunity, "BASE.SUCCESS", undefined));
  } catch (error) {
    console.error("Error updating community logo:", error);
    res.status(500).json(ApiResponse.error("An error occurred while updating the community logo"));
  }
});

export default apiRoute;

// Disable the default body parser to allow multer to parse multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};
