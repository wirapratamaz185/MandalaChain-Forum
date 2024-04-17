// api/auth/[...nextauth]
import { authOptions } from "@/utils/auth/auth";
import NextAuth from "next-auth/next";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST}