// utils/helper.ts
import { ApiError, BaseError } from "@/utils/response/baseError";
import { NextResponse, NextRequest } from "next/server";
import { compare, hash, genSalt } from "bcrypt";
import { Payload } from "../utils/interface/jwt";
import { sign, verify } from "jsonwebtoken";
import { secret } from "./auth/secret";
import next, { NextApiRequest } from "next";
import {} from "../utils/passport/passport";
import passport from "passport";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { getCookie } from "cookies-next";
import { HttpStatusCode } from "axios";
import { z, ZodSchema } from "zod";

interface ValidationError {
  validation: string
  code: string
  message: string
}

export class ApiResponse<T> {
  readonly data: T | null;
  readonly message: string;
  readonly status: boolean;
  readonly statusCode: HttpStatusCode;

  constructor(
    data: T,
    message: string,
    status: boolean,
    statusCode?: HttpStatusCode
  ) {
    this.data = data;
    this.message = message;
    this.status = status;
    this.statusCode = statusCode ?? HttpStatusCode.InternalServerError;
  }

  static success<T>(
    data: T,
    message: string = "success",
    statusCode: HttpStatusCode = HttpStatusCode.Ok
  ): ApiResponse<T> {
    let apiResponse = new ApiResponse<T>(data, message, true, statusCode);
    return apiResponse;
  }

  static error<T>(
    data: T,
    message: string = "error",
    statusCode: HttpStatusCode = HttpStatusCode.InternalServerError
  ): ApiResponse<T> {
    let apiResponse = new ApiResponse<T>(data, message, false, statusCode);
    return apiResponse;
  }
}

//this is for coresponding for handling multiple error type
export function handleError(error: any) {
  let status;
  let message;

  if (error instanceof BaseError) {
    status = error.statusCode;
    message = error.message;
  } else {
    status = 500;
    message = error.message;
  }

  return NextResponse.json(ApiResponse.error(null, error.message, status), {
    status: status,
  });
}

//this is for coresponding helper api response
export class ResponseHandler<T> {
  public success(data: T, message = "success", statusCode = 200) {
    return NextResponse.json(ApiResponse.success(data, message, statusCode), {
      status: statusCode,
    });
  }

  public error(message: string, statusCode = 500) {
    return NextResponse.json(ApiResponse.error(null, "error", statusCode), {
      status: statusCode,
    });
  }
}

//bcrypt
export class Bcrypt {
  static async compare(
    password: string,
    hadshedpassword: string
  ): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  public static async createHashPassword(
    plainPassword: string
  ): Promise<string> {
    const salt = await genSalt(12);

    const hashPass = await hash(plainPassword, salt);

    return hashPass;
  }

  public static async comparePassword(
    plainPassword: string,
    currentHash: string
  ): Promise<boolean> {
    const isMatch = await compare(plainPassword, currentHash);

    return isMatch;
  }
}

//jsonwebtoken
export class JWT {
  public static async generateJWT(payload: any): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload as string | object | Buffer,
        process.env.SECRET_KEY as string,
        {
          expiresIn: "1d", // Set expiresIn to 1 day
        },
        (err: any, token: string | undefined) => {
          if (err) {
            reject(err);
          } else {
            resolve(token as string);
          }
        }
      );
    });
  }
  static sign(
    payload: any,
    arg1: string,
    arg2: { expiresIn: string },
    arg3: (err: any, token: any) => void
  ) {
    throw new Error("Method not implemented.");
  }
}

// manual JWT middleware
export const MiddlewareAuthorization = async (
  req: NextApiRequest,
  secret: string
): Promise<string | Payload> => {
  // console.log("All headers received:", req.headers);
  const token = getCookie("access_token", { req });
  // console.log("Token directly from headers:", req.headers.authorization);
  // console.log("====================================");
  // console.log("Token", token);
  // console.log("====================================");

  if (!token) {
    console.log("====================================");
    // console.error("No Token Found in Cookie");
    throw new ApiError(
      "Authorization token is missing",
      HttpStatusCode.Unauthorized
    );
    console.log("====================================");
  }

  // verify and decode the token
  // let decodedToken;
  try {
    const decodedToken = jwt.verify(token as string, secret);
    if (typeof decodedToken === "object" && "id" in decodedToken) {
      return decodedToken.id;
    } else {
      throw new ApiError(
        "Payload format incorrect",
        HttpStatusCode.Unauthorized
      );
    }
  } catch (error) {
    console.log("====================================");
    throw new ApiError(
      `Token validation error: ${(error as any).message}`,
      HttpStatusCode.Unauthorized
    );
    console.log("====================================");
  }
};
export const validator = {
  validate: async (schema: ZodSchema, data: any) => {
    try {
      return schema.parseAsync(data);
    } catch (error:any) {
      console.error("Validation error:", error);
      throw new ApiError(error.message, 400);
    }
  },
};

// export const validator = new RequestValidation();