// api/auth/google.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3000/api/auth/googleCallback",
      scope: ['email', 'profile'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(`GoogleStrategy: Trying to authenticate user with email: ${profile.emails![0].value}`);
        const user = await prisma.user.findUnique({
          where: {
            email: profile.emails![0].value,
          },
        });
        if (!user) {
          console.log(`GoogleStrategy: User with email: ${profile.emails![0].value} not found. Creating new user.`);
          const newUser = await prisma.user.create({
            data: {
              email: profile.emails![0].value,
              username: profile.displayName,
              imageUrl: profile.photos![0].value,
              password: "",
            },
          });
          console.log(`GoogleStrategy: New user with email: ${profile.emails![0].value} created successfully`);
          return done(null, newUser);
        }
        console.log(`GoogleStrategy: User with email: ${profile.emails![0].value} authenticated successfully`);
        return done(null, user);
      } catch (error) {
        console.log(`GoogleStrategy: Error occurred while authenticating user with email: ${profile.emails![0].value}`);
        console.error(error);
        if (error instanceof Error) {
          return done(error);
        } else {
          return done(new Error("Error in google oauth"));
        }
      } finally {
        await prisma.$disconnect();
      }
    }
  )
);

// Google auth handler
export default async function googleAuth(req: NextApiRequest, res: NextApiResponse) {
  passport.authenticate('google', (err: any, user: any) => {
    if (err) return res.status(500).json({ error: "Authentication Failed" });
    if (!user) return res.redirect('/login?error=NoUser');

    // You would typically use a token or session here
    // For simplicity we are just returning user
    return res.status(200).json({ user });
  })(req, res);
}