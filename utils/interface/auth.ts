// utils/interface/auth.ts:
import { NextApiRequest, NextApiResponse } from "next";

export interface User {
  id: string;
  email: string;
  password?: string;
  username: string;
  imageUrl?: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

export interface LoginRequest extends NextApiRequest {
  body: LoginRequestBody;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  bio: string;
  imageUrl: string;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  id: string | undefined;
}
