// api/auth/login.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { ApiResponse } from "../../../utils/helper";
import jwt from 'jsonwebtoken';
import { secret } from "../../../utils/auth/secret";

const prisma = new PrismaClient();

export default async function login(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json(ApiResponse.error("Method Not Allowed"));
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json(ApiResponse.error("Missing Required Fields"));
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json(ApiResponse.error("User not found"));
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json(ApiResponse.error("Invalid Credentials"));
        }

        if(!secret){
            console.error("Secret is not defined");
            return res.status(500).json(ApiResponse.error("BASE.ERROR"));
        }

        const token = jwt.sign({
            id: user.id,
            email: user.email,
        }, secret, { expiresIn: '1h' })

        return res
            .status(200)
            .json(ApiResponse.success({ user, token }, "BASE.SUCCESS", undefined));
    } catch (error) {
        console.error(error);
        return res.status(500).json(ApiResponse.error("BASE.ERROR"));
    }
}