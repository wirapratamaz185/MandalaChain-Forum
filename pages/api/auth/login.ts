// pages/api/auth/login.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { PrismaClient } from "@prisma/client";
import { JWT } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { User, LoginRequest } from "../../../utils/interface/auth";
import { NextApiResponse } from "next";
import { setupLocalStrategy } from "@/utils/passport/passport";
import { setCookie } from "cookies-next";

setupLocalStrategy(passport);

const prisma = new PrismaClient();

export default function login(req: LoginRequest, res: NextApiResponse) {
  console.debug("Debug: login function called with req.body:", req.body); // Debug statement
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method Not Allowed" });
  }

  passport.authenticate(
    "local",
    async (err: any, user: { id: any; email: any }, info: { message: any }) => {
      if (err) {
        console.error("Authentication error:", err); // Log the error for debugging
        return res.status(500).json({ status: "error", message: "Server error" });
      }
      if (!user) {
        // The passport local strategy should pass the info object with details
        console.warn("Authentication failed:", info.message);
        return res.status(401).json({ status: "error", message: info.message || "Invalid credentials" });
      }

      try {
        // Generate JWT token using the JWT helper class
        const payload = { userId: user.id, email: user.email, id: user.id };
        const token = await JWT.generateJWT(payload);

        console.log("==================================");
        console.log("Payload for JWT:", payload);
        console.log("==================================");
        console.log("==================================");
        console.log("JWT generated:", token);
        console.log("==================================");

        setCookie("access_token", token, { req, res, maxAge: 60 * 6 * 24 });
        return res.redirect(303, `/?token=${token}`);

        // This line will never be reached due to the redirect above
        // return res.status(200).json({
        //   status: "success",
        //   data: {
        //     user: { id: user.id, email: user.email },
        //     token: token,
        //   },
        //   message: "Login successful"
        // });
      } catch (tokenError) {
        console.error("Token generation error:", tokenError); // Log the error for debugging
        return res.status(500).json({ status: "error", message: "Token generation failed" });
      }
    }
  )(req, res);
}