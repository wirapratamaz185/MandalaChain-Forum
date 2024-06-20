import passport from "passport";
import { Strategy as GithubStrategy } from "passport-github2";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../prisma/prisma";


// Initialize GitHub OAuth Strategy
passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        "https://mandala-chain-forum.vercel.app/api/auth/githubCallback",
      scope: ["user:email", "read:user"],
    },
    async (
      accessToken: any,
      refreshToken: any,
      profile: {
        id: any;
        emails: string | any[];
        username: any;
        displayName: any;
        photos: { value: any }[];
      },
      done: (
        arg0: unknown,
        arg1:
          | {
              id: string;
              username: string | null;
              email: string;
              password: string;
              imageUrl: string | null;
            }
          | undefined
      ) => any
    ) => {
      console.log(`Processing GitHub user with id: ${profile.id}`);

      if (!profile.emails || profile.emails.length === 0) {
        console.error("GitHub profile is missing email information.");
        return done(
          new Error("GitHub profile does not include an email."),
          undefined
        );
      }

      const email = profile.emails[0].value;
      if (!email) {
        console.error("Failed to retrieve email from GitHub profile.");
        return done(
          new Error("Unable to retrieve email from GitHub user data."),
          undefined
        );
      }

      try {
        const user = await prisma.user.upsert({
          where: { email },
          create: {
            email,
            username: profile.username || profile.displayName || "unknown",
            imageUrl: profile.photos[0]?.value || "",
            password: ''
          },
          update: {
            username: profile.username || profile.displayName || "unknown",
            imageUrl: profile.photos[0]?.value || "",
          },
        });
        return done(null, user);
      } catch (err) {
        console.error("Error in creating/updating GitHub user:", err);
        return done(err, undefined);
      }
    }
  )
);

// Serialization and deserialization logic
passport.serializeUser((user: any, done: any) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: any, done: any) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// GitHub Auth Route Handler
export default function githubAuthHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  passport.authenticate(
    "github",
    { session: false },
    (err: { message: any }, user: any, info: any) => {
      if (err) {
        console.error("Authentication Error:", err);
        return res
          .status(500)
          .json({ error: "Authentication Error", message: err.message });
      }

      if (!user) {
        return res.redirect("/login?error=User Authentication Failed");
      }

      // Process the user, typically set cookies or session data here
      console.log("User authenticated via GitHub:", user);
      res.status(200).json(user);
    }
  )(req, res);
}
