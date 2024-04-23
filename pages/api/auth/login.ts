// pages/api/auth/login.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { secret } from "../../../utils/auth/secret";
import { ApiResponse } from "../../../utils/helper";
import { User, LoginRequest } from "../../../utils/interface/auth";
import { NextApiResponse } from "next";

const prisma = new PrismaClient();

// Setting up Passport's local strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: false,
    },
    async (email, password, done) => {
      try {
        const user = (await prisma.user.findUnique({
          where: { email },
        })) as User;
        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return done(null, false, { message: "Invalid Credentials" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default function login(req: LoginRequest, res: NextApiResponse) {
  console.debug("Debug: login function called with req.body:", req.body); // Debug statement
  if (req.method !== "POST") {
    return res.status(405).json(ApiResponse.error("Method Not Allowed"));
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(ApiResponse.error("Missing Required Fields"));
  }

  passport.authenticate("local", (err: any, user: { id: any; email: any }) => {
    if (err) {
      return res.status(500).json(ApiResponse.error("BASE.ERROR"));
    }

    if (!user) {
      return res.status(400).json(ApiResponse.error("Invalid Credentials"));
    }

    if (!secret) {
      console.error("Secret is not defined");
      return res.status(500).json(ApiResponse.error("BASE.ERROR"));
    }

    // remove password before sending response
    const { password, ...userWithoutPassword } = user as User;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      secret,
      { expiresIn: "1h" }
    );

    return res
      .status(200)
      .json(
        ApiResponse.success(
          { user: userWithoutPassword, token },
          "BASE.SUCCESS",
          undefined
        )
      );
  })(req, res);
}
