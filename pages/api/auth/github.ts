// api/auth/github.ts
import passport from "passport";
import { Strategy as GithubStrategy } from "passport-google-oauth20";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        "http://localhost:3000/api/auth/githubCallback",
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(
          `GithubStrategy: Trying to authenticate user with email: ${
            profile.emails![0].value
          }`
        );
        const user = await prisma.user.findUnique({
          where: {
            email: profile.emails![0].value,
          },
        });
        if (!user) {
          console.log(
            `GithubStrategy: User with email: ${
              profile.emails![0].value
            } not found. Creating new user.`
          );
          const newUser = await prisma.user.create({
            data: {
              email: profile.emails![0].value,
              username: profile.username,
              imageUrl: profile.photos![0].value,
              password: "placeholderPassword", // placeholder password
            },
          });
          console.log(
            `GithubStrategy: New user with email: ${
              profile.emails![0].value
            } created successfully`
          );
          return done(null, newUser);
        }
        console.log(
          `GithubStrategy: User with email: ${
            profile.emails![0].value
          } authenticated successfully`
        );
        return done(null, user);
      } catch (error) {
        console.log(
          `GithubStrategy: Error occurred while authenticating user with email: ${
            profile.emails![0].value
          }`
        );
        console.error(error);
        if (error instanceof Error) {
          return done(error);
        } else {
          return done(new Error("Error in github oauth"));
        }
      } finally {
        await prisma.$disconnect();
      }
    }
  )
);

// Github auth handler
export default function githubAuth(req: NextApiRequest, res: NextApiResponse) {
  passport.authenticate('github', (err: any, user: any, info: any) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Authentication Failed' });
    }
    if (!user) {
      return res.redirect('/login?error=NoUser');
    }

    // Assuming user is successfully retrieved
    return res.status(200).json({ user });
  })(req, res, (err: any) => {
    if (err) {
      console.error('Next function error:', err);
    }
  });
}