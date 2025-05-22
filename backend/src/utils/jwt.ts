import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { SessionDocument } from "../models/session.model";
import { UserDocument } from "../models/user.model";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";

export type RefreshTokenPayload = {
  sessionId: SessionDocument["_id"];
};

type AccessTokenPayload = {
  userId: UserDocument["_id"];
  sessionId: SessionDocument["_id"];
};

type SignOptionsAndSecret = SignOptions & { secret: string };

const defaults: SignOptions = {
  audience: ["user"],
};

export const accessTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "15m",
  secret: JWT_SECRET,
};

export const refreshTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "30d",
  secret: JWT_REFRESH_SECRET,
};

export const signToken = (
  payload: RefreshTokenPayload | AccessTokenPayload,
  options?: SignOptionsAndSecret
) => {
  const { secret, ...signOptions } = options || accessTokenSignOptions;

  return jwt.sign(payload, secret, {
    ...defaults,
    ...signOptions,
  });
};

export const verifyToken = <TPayload extends object = AccessTokenPayload>(
  token: string,
  options?: VerifyOptions & { secret: string }
) => {
  const { secret = JWT_SECRET, ...verifyOptions } =
    options || accessTokenSignOptions;

  try {
    const payload = jwt.verify(token, secret, {
      ...defaults,
      ...verifyOptions,
    }) as TPayload;

    return {
      payload,
    };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};
