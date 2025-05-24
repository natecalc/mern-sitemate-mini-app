import { RequestHandler } from "express";
import appAssert from "../utils/appAssert";
import { UNAUTHORIZED } from "../constants/http";
import { AppErrorCode } from "../constants/appErrorCode";
import { verifyToken } from "../utils/jwt";

export const authenticate: RequestHandler = (req, res, next) => {
  // 1. get users access token
  const accessToken = req.cookies.accessToken as string | undefined;
  appAssert(
    accessToken,
    UNAUTHORIZED,
    " Not authorized",
    AppErrorCode.InvalidAccessToken
  );

  //2. verify access token
  const { error, payload } = verifyToken(accessToken);
  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "Token expired" : "Invalid token",
    AppErrorCode.InvalidAccessToken
  );

  const { userId, sessionId } = payload;

  console.log(userId);

  // 3.
  req.userId = userId;
  req.sessionId = sessionId;

  next();
};
