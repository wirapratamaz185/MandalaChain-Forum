import { NextApiRequest, NextApiResponse } from "next";

export interface User {
    id: string;
    email: string;
    password: string;
}

interface LoginRequestBody {
    email: string;
    password: string;   
}

export interface LoginRequest extends NextApiRequest {
    body: LoginRequestBody;
}