// utils/schema.ts
import { z } from "zod";

// User Validator
export const UserValidator = z.object({
  id: z.string().uuid(),
  username: z.string().optional(),
  email: z.string().email({ message: "Email is not valid" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  imageUrl: z.string().url().optional(),
});

// Post Validator
export const PostValidator = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  body: z.string(),
  imageUrl: z.string().url().optional(),
  vote: z.number(),
  community_id: z.string().uuid(),
  created_at: z.date().default(new Date()),
});

// Comment Validator
export const CommentValidator = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  text: z.string(),
  post_id: z.string().uuid(),
  created_at: z.date().default(new Date()),
});

// Community Validator
export const CommunityValidator = z.object({
  id: z.string().uuid(),
  name: z.string(),
  imageUrl: z.string().url().optional(),
  community_type_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  created_at: z.date().default(new Date()),
});

// Vote Validator
export const VoteValidator = z.object({
  up: z.boolean({
    required_error: "Vote status is required",
    message: "Invalid type, expected boolean",
  }),
});

// Account Validator
export const AccountValidator = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  providerType: z.string(),
  providerId: z.string(),
  providerAccountId: z.string(),
  refreshToken: z.string().optional(),
  accessToken: z.string().optional(),
  accessTokenExpires: z.date().optional(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

// Session Validator
export const SessionValidator = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  expires: z.date(),
  sessionToken: z.string(),
  accessToken: z.string(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

// VerificationRequest Validator
export const VerificationRequestValidator = z.object({
  id: z.string().uuid(),
  identifier: z.string(),
  token: z.string(),
  expires: z.date(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

// CommunityType Validator
export const CommunityTypeValidator = z.object({
  id: z.string().uuid(),
  type: z.enum(["PUBLIC", "PRIVATE"]),
});

// Subscriber Validator
export const SubscriberValidator = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  community_id: z.string().uuid(),
  created_at: z.date().default(new Date()),
});

// Bookmark Validator
export const BookmarkValidator = z.object({
  id: z.string().uuid(),
  post_id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.date().default(new Date()),
});
