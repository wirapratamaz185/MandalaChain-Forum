// src/pages/api/comments/edit/{commentId}
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, MiddlewareAuthorization } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { ApiError } from "../../../utils/response/baseError";
import { prisma } from "../../../prisma/prisma";

export default async function EDIT(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    const { commentId } = req.query;
    if (typeof commentId !== "string") {
        return res.status(400).json(ApiResponse.error("Comment ID must be a string"));
    }

    if (req.method !== "PUT") {
        return res.status(405).json(ApiResponse.error("Method not allowed"));
    }

    const { text } = req.body;
    if (!text || typeof text !== "string") {
        return res
            .status(400)
            .json(ApiResponse.error("Text is required and must be a string"));
    }

    let userId: string;
    try {
        const payload = await MiddlewareAuthorization(req, secret as string);
        if (!payload || typeof payload !== "string")
            throw new Error("Unauthorized: No userId decoded");
        userId = payload;

        // check if comment exists
        const comment = await prisma.comment.findFirst({
            where: { id: commentId },
        });
        if (!comment) {
            return res.status(404).json(ApiResponse.error("Comment not found"));
        }

        const update = await prisma.comment.update({
            where: { id: commentId },
            data: {
                text,
            },
            select: {
                id: true,
                text: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        return res.status(200).json(ApiResponse.success(update, "Comment updated"));
    } catch (error) {
        console.error("Error: OnEditComment", error);
        return res.status(500).json(ApiResponse.error("Something went wrong"));
    }
};