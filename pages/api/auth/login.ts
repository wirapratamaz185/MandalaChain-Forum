// pages/api/auth/login.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { PrismaClient } from "@prisma/client";
import { JWT, ApiResponse } from "../../../utils/helper";
import { secret } from "../../../utils/auth/secret";
import { User, LoginRequest } from "../../../utils/interface/auth";
import { NextApiResponse } from "next";
import { setupLocalStrategy } from "@/utils/passport/passport";
import { setCookie } from "cookies-next";

setupLocalStrategy(passport);

const prisma = new PrismaClient();

// Setting up Passport's local strategy
// passport.use(
//   new LocalStrategy(
//     {
//       usernameField: "email",
//       passwordField: "password",
//       session: false,
//     },
//     async (email, password, done) => {
//       try {
//         const user = (await prisma.user.findUnique({
//           where: { email },
//         })) as User;
//         if (!user) {
//           return done(null, false, { message: "User not found" });
//         }

//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//           return done(null, false, { message: "Invalid Credentials" });
//         }

//         return done(null, user);
//       } catch (error) {
//         return done(error);
//       }
//     }
//   )
// );

export default function login(req: LoginRequest, res: NextApiResponse) {
  console.debug("Debug: login function called with req.body:", req.body); // Debug statement
  if (req.method !== "POST") {
    return res.status(405).json(ApiResponse.error("Method Not Allowed"));
  }

  // const { email, password } = req.body;

  // if (!email || !password) {
  //   return res.status(400).json(ApiResponse.error("Missing Required Fields"));
  // }

  passport.authenticate(
    "local",
    async (err: any, user: { id: any; email: any }, info: { message: any }) => {
      if (err) {
        return res.status(500).json(ApiResponse.error("Server error"));
      }
      if (!user) {
        // The passport local strategy should pass the info object with details
        return res.status(401).json(ApiResponse.error(info.message));
      }

      // Generate JWT token using the JWT helper class
      const payload = { userId: user.id, email: user.email, id: user.id };
      const token = await JWT.generateJWT(payload);

      console.log("==================================");
      console.log("Payload for JWT:", payload);
      console.log("==================================");
      console.log("==================================");
      console.log("JWT generated:", token);
      console.log("==================================");

      setCookie('access_token', token, { req, res, maxAge: 60 * 6 * 24 });
      return res.redirect(303, "/");

      return res.status(200).json(
        ApiResponse.success(
          {
            user: { id: user.id, email: user.email },
            token: token,
          },
          "Login successful"
        )
      );
    }
  )(req, res);
}
