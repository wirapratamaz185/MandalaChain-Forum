// utils/passport/passport.ts
import passport from "passport";
import { Bcrypt } from "../helper";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GithubStrategy } from "passport-github";
import { PrismaClient, User } from "@prisma/client";
const prisma = new PrismaClient();

// local strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        console.log(`LocalStrategy: Trying to authenticate user with email: ${email}`);
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });
        if (!user) {
          console.log(`LocalStrategy: User with email: ${email} not found`);
          return done(null, false, { message: "User not found" });
        }
        const isValid = await Bcrypt.compare(password, user.password);
        if (!isValid) {
          console.log(`LocalStrategy: Incorrect password for user with email: ${email}`);
          return done(null, false, { message: "Incorrect password" });
        }
        console.log(`LocalStrategy: User with email: ${email} authenticated successfully`);
        return done(null, user);
      } catch (error) {
        console.log(`LocalStrategy: Error occurred while authenticating user with email: ${email}`);
        console.error(error);
        return done(error);
      } finally {
        passport.serializeUser((user, done) => {
          done(null, user);
        });

        passport.deserializeUser((user, done) => {
          return done(null, user as User);
        });
        await prisma.$disconnect();
      }
    }
  )
);

// Google Oauth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3000/api/auth/googleCallback",
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
              password: "placeholderPassword", // placeholder password
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

// Github Oauth Strategy
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
        console.log(`GithubStrategy: Trying to authenticate user with email: ${profile.emails![0].value}`);
        const user = await prisma.user.findUnique({
          where: {
            email: profile.emails![0].value,
          },
        });
        if (!user) {
          console.log(`GithubStrategy: User with email: ${profile.emails![0].value} not found. Creating new user.`);
          const newUser = await prisma.user.create({
            data: {
              email: profile.emails![0].value,
              username: profile.username,
              imageUrl: profile.photos![0].value,
              password: "placeholderPassword", // placeholder password
            },
          });
          console.log(`GithubStrategy: New user with email: ${profile.emails![0].value} created successfully`);
          return done(null, newUser);
        }
        console.log(`GithubStrategy: User with email: ${profile.emails![0].value} authenticated successfully`);
        return done(null, user);
      } catch (error) {
        console.log(`GithubStrategy: Error occurred while authenticating user with email: ${profile.emails![0].value}`);
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

// Serializing the user ID to the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserializing the user from the session
passport.deserializeUser(async (id: unknown, done) => {
  try {
    console.log(`Deserializing user with ID: ${id}`);
    const user = await prisma.user.findUnique({
      where: { id: id as string },
    });
    console.log(`Deserialized user with ID: ${id}`);
    done(null, user);
  } catch (error) {
    console.log(`Error occurred while deserializing user with ID: ${id}`);
    console.error(error);
    done(error);
  }
});
export default passport;