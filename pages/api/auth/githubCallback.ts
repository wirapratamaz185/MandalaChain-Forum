// pages/api/auth/githubCallback.ts
import passport from "../../../utils/passport/passport";
import { NextApiRequest, NextApiResponse } from "next";
import { JWT, ApiResponse } from "../../../utils/helper";
import { setCookie } from "cookies-next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  passport.authenticate(
    "github",
    async (err: { message: any }, user: { id: any; email: any }, info: any) => {
      if (err) {
        return res
          .status(500)
          .json(ApiResponse.error(null, `Error: ${err.message}`));
      }
      if (!user) {
        return res.status(400).json(ApiResponse.error(null, "User not found"));
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
      } catch (jwtError) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to generate token" });
      }
    }
  )(req, res);
}
