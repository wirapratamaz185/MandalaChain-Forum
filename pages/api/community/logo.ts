import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";
import multer from "multer";
import nextConnect from "next-connect";

const prisma = new PrismaClient();

interface MulterNextApiRequest extends NextApiRequest {
  file: Express.Multer.File;
  env: any;
}

interface ExtendedNextApiRequest extends NextApiRequest {
  file: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
});

const apiRoute = nextConnect({
  onError(error, req, res) {
    res
      .status(501)
      .json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

// Add the middleware to handle file upload
apiRoute.use(upload.single("image"));

apiRoute.patch(async (req: MulterNextApiRequest, res: NextApiResponse) => {
  const { communityId } = req.query;

  let userId;
  try {
    // Ensure secret is defined before calling MiddlewareAuthorization
    if (!secret) {
      throw new ApiError("Secret is undefined", 500);
    }
    userId = await MiddlewareAuthorization(req as NextApiRequest, secret);
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(ApiResponse.error(error.message));
    }
    return res.status(500).json(ApiResponse.error("An unknown error occurred"));
  }

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
            "You are not authorized to change the community logo"
          )
        );
    }

    // Check if an image was uploaded
    if (!req.file) {
      return res.status(400).json(ApiResponse.error("No image uploaded"));
    }

    // If there's an existing logo, delete it from cloud storage
    if (community.imageUrl) {
      await deleteImage(community.imageUrl);
    }

    // Upload the new image to cloud storage and get the URL
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

    res
      .status(200)
      .json(
        ApiResponse.success(
          updatedCommunity,
          "Community logo updated successfully"
        )
      );
  } catch (error) {
    console.error("Error updating community logo:", error);
    res
      .status(500)
      .json(
        ApiResponse.error("An error occurred while updating the community logo")
      );
  }
});

// ... existing DELETE method code

export default apiRoute;

// Disable the default body parser to allow multer to parse multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};
function deleteImage(imageUrl: string) {
  throw new Error("Function not implemented.");
}

function uploadImage(buffer: Buffer) {
  throw new Error("Function not implemented.");
}
