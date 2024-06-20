// utils/passport/passport.ts
import passport from "passport";
import bcrypt from "bcryptjs";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GithubStrategy } from "passport-github2";
import { PrismaClient, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
const prisma = new PrismaClient();

// local strategy
// passport.use(
//   new LocalStrategy(
//     {
//       usernameField: "email",
//       passwordField: "password",
//     },
//     async (email, password, done) => {
//       try {
//         console.log(
//           `LocalStrategy: Trying to authenticate user with email: ${email}`
//         );
//         const user = await prisma.user.findUnique({
//           where: {
//             email,
//           },
//         });
//         if (!user) {
//           console.log(`LocalStrategy: User with email: ${email} not found`);
//           return done(null, false, { message: "User not found" });
//         }
//         const isValid = await Bcrypt.compare(password, user.password);
//         if (!isValid) {
//           console.log(
//             `LocalStrategy: Incorrect password for user with email: ${email}`
//           );
//           return done(null, false, { message: "Incorrect password" });
//         }
//         console.log(
//           `LocalStrategy: User with email: ${email} authenticated successfully`
//         );
//         return done(null, user);
//       } catch (error) {
//         console.log(
//           `LocalStrategy: Error occurred while authenticating user with email: ${email}`
//         );
//         console.error(error);
//         return done(error);
//       } finally {
//         passport.serializeUser((user, done) => {
//           done(null, user);
//         });

//         passport.deserializeUser((user, done) => {
//           return done(null, user as User);
//         });
//         await prisma.$disconnect();
//       }
//     }
//   )
// );

export function setupLocalStrategy(passportInstance: { use: (arg0: LocalStrategy) => void; }) {
  passportInstance.use(
      new LocalStrategy({
          usernameField: "email",
          passwordField: "password",
      },
      async (email, password, done) => {
          try {
              const user = await prisma.user.findUnique({ where: { email } });
              if (!user) {
                  return done(null, false, { message: "User not found" });
              }
              const isMatch = await bcrypt.compare(password, user.password);
              if (!isMatch) {
                  return done(null, false, { message: "Invalid credentials" });
              }
              return done(null, user);
          } catch (error) {
              return done(error);
          }
      }
  ));
}

// Google Oauth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "https://mandala-chain-forum.vercel.app/api/auth/googleCallback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(
          `GoogleStrategy: Trying to authenticate user with email: ${
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
            `GoogleStrategy: User with email: ${
              profile.emails![0].value
            } not found. Creating new user.`
          );
          const newUser = await prisma.user.create({
            data: {
              email: profile.emails![0].value,
              username: profile.displayName,
              imageUrl: profile.photos![0].value,
              password: "placeholderPassword", // placeholder password
            },
          });
          console.log(
            `GoogleStrategy: New user with email: ${
              profile.emails![0].value
            } created successfully`
          );
          return done(null, newUser);
        }
        console.log(
          `GoogleStrategy: User with email: ${
            profile.emails![0].value
          } authenticated successfully`
        );
        return done(null, user);
      } catch (error) {
        console.log(
          `GoogleStrategy: Error occurred while authenticating user with email: ${
            profile.emails![0].value
          }`
        );
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

// Github Oauth Strategy
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
            password: "",
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
// export default function githubAuthHandler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   passport.authenticate(
//     "github",
//     { session: false },
//     (err: { message: any }, user: any, info: any) => {
//       if (err) {
//         console.error("Authentication Error:", err);
//         return res
//           .status(500)
//           .json({ error: "Authentication Error", message: err.message });
//       }

//       if (!user) {
//         return res.redirect("/login?error=User Authentication Failed");
//       }

//       // Process the user, typically set cookies or session data here
//       console.log("User authenticated via GitHub:", user);
//       res.status(200).json(user);
//     }
//   )(req, res);
// }

export default passport;