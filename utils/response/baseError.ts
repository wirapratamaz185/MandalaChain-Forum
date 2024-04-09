import { HttpStatusCode } from "axios";

export class BaseError extends Error {
  public statusCode: HttpStatusCode;
  constructor(message: string, statusCode: HttpStatusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class ApiError extends BaseError {
  constructor(
    messgae: string,
    statusCode: HttpStatusCode = HttpStatusCode.InternalServerError
  ) {
    super(messgae, statusCode);
  }
}