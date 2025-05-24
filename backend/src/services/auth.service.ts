import { APP_ORIGIN } from "../constants/env";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from "../constants/http";
import VerificationCodeType from "../constants/verificationCodeType";
import SessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verificationCode.model";
import appAssert from "../utils/appAssert";
import { hashValue } from "../utils/bcrypt";
import {
  fiveMinutesAgo,
  ONE_DAY_MS,
  oneHourFromNow,
  oneYearFromNow,
  thirtyDaysFromNow,
} from "../utils/date";
import {
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
} from "../utils/emailTemplates";
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signToken,
  verifyToken,
} from "../utils/jwt";
import { sendMail } from "../utils/sendMail";

export type CreateAccountParams = {
  email: string;
  password: string;
  userAgent?: string;
};
export type LoginParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const createAccount = async (data: CreateAccountParams) => {
  // 1. check if user already exists
  const existingUser = await UserModel.findOne({
    email: data.email,
  });

  // 2. if user exists, throw error
  appAssert(!existingUser, CONFLICT, "Email already in use");

  // 3. create user
  const user = await UserModel.create({
    email: data.email,
    password: data.password,
  });

  // 4. pull out the userId for readability
  const userId = user._id;

  // 5. create verification code/token
  const verificationCode = await VerificationCodeModel.create({
    userId,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  // defined our verification path
  const url = `${APP_ORIGIN}/verify-email/${verificationCode._id}`;
  // 5. send verification email
  const { error } = await sendMail({
    to: user.email,
    ...getVerifyEmailTemplate(url),
  });

  if (error) {
    // 6. if email fails to send, throw error
    console.log("Error sending email", error);
  }

  // 6. create session (unit of time for user login time (30 days by default))
  const session = await SessionModel.create({
    userId,
    userAgent: data.userAgent,
  });

  // 7. sign access token and refresh token
  const refreshToken = signToken(
    {
      sessionId: session._id,
    },
    refreshTokenSignOptions
  );

  const accessToken = signToken({
    sessionId: session._id,
    userId,
  });

  // 8. return tokens & user (without password)
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

export const loginUser = async ({
  email,
  password,
  userAgent,
}: LoginParams) => {
  // 1. check if user exists
  const user = await UserModel.findOne({
    email,
  });

  // 2. if user does not exist, throw error
  appAssert(user, UNAUTHORIZED, "Invalid email or password");

  // 3. verify password
  const isValid = await user.comparePassword(password);

  // 4. if password is invalid, throw error
  appAssert(isValid, UNAUTHORIZED, "Invalid email or password");

  // 5. create session
  const userId = user._id;
  const session = await SessionModel.create({
    userId,
    userAgent,
  });

  const sessionInfo = {
    sessionId: session._id,
  };

  // 6. sign refresh token and access token
  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);

  const accessToken = signToken({
    ...sessionInfo,
    userId,
  });

  // 7. return tokens & user (without password)
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

export const refreshUserAccessToken = async (refreshToken: string) => {
  // 1. validate the refresh token
  const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });

  // 2. if the refresh token is invalid, throw error
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  // 3. check if the session exists
  const session = await SessionModel.findById(payload.sessionId);

  // 4. if the session does not exist, throw error
  const now = Date.now();
  appAssert(
    session && session.expiresAt.getTime() > now,
    UNAUTHORIZED,
    "Session expired"
  );

  // 5. check if session is expiring soon (for client UX). Refresh session if it expires in the next 24 hours
  const sessionNeedsRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS;

  // 6. sign new access token (can be refreshed every time a new access token is created, but leaving as is for now)
  if (sessionNeedsRefresh) {
    session.expiresAt = thirtyDaysFromNow();
    await session.save();
  }

  // 7. set new refresh token if session was refreshed
  const newRefreshToken = sessionNeedsRefresh
    ? signToken(
        {
          sessionId: session._id,
        },
        refreshTokenSignOptions
      )
    : undefined;

  // 8. sign access token and refresh token
  const accessToken = signToken({
    userId: session.userId,
    sessionId: session._id,
  });

  // 9. return tokens
  return {
    accessToken,
    newRefreshToken,
  };
};

export const verifyEmail = async (code: string) => {
  // 1. check if the verification code exists
  const validCode = await VerificationCodeModel.findOne({
    _id: code,
    type: VerificationCodeType.EmailVerification,
    expiresAt: { $gt: new Date() },
  });

  // 2. if the verification code does not exist, throw error
  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  // 3. update user to verified
  const user = await UserModel.findByIdAndUpdate(
    validCode.userId,
    {
      verified: true,
    },
    {
      new: true, // need to add this or it wont update details
    }
  );

  // 4. if the user does not exist, throw error
  appAssert(user, INTERNAL_SERVER_ERROR, "Failed to verify email");

  // 5. delete verification code
  await VerificationCodeModel.findByIdAndDelete(validCode._id);

  // 6. return user
  return {
    user: user.omitPassword(),
  };
};

export const sendPasswordResetEmail = async (email: string) => {
  // 1. get user by email
  const user = await UserModel.findOne({
    email,
  });
  appAssert(user, NOT_FOUND, "User not found");

  // 2. check email rate limit and throw error if broken
  const fiveMinAgo = fiveMinutesAgo();
  const count = await VerificationCodeModel.countDocuments({
    userId: user._id,
    type: VerificationCodeType.PasswordReset,
    createdAt: { $gt: fiveMinAgo },
  });
  appAssert(
    count <= 1, // as we are limiting to 2 emails in 5 minutes we must check if count is less than or equal to 1
    TOO_MANY_REQUESTS,
    "Too many requests, please try again later."
  );

  // 3. create verification code
  const expiresAt = oneHourFromNow();
  const verificationCode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeType.PasswordReset,
    expiresAt,
  });

  // 4. send email
  const url = `${APP_ORIGIN}/password/reset?code=${verificationCode._id}&exp=${verificationCode.expiresAt.getTime()}`;

  const { data, error } = await sendMail({
    to: user.email,
    ...getPasswordResetTemplate(url),
  });
  appAssert(
    data?.id,
    INTERNAL_SERVER_ERROR,
    `${error?.name}- ${error?.message}`
  );

  // 5. return success message
  return {
    url,
    emailId: data.id,
    message: "Password reset email sent",
  };
};

export const resetPassword = async ({
  password,
  verificationCode,
}: {
  password: string;
  verificationCode: string;
}) => {
  // 1. get verification code
  const validCode = await VerificationCodeModel.findOne({
    _id: verificationCode,
    type: VerificationCodeType.PasswordReset,
    expiresAt: { $gt: new Date() },
  });
  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  // 2. if valid, update user password with hashed password
  const updateUser = await UserModel.findByIdAndUpdate(
    validCode.userId,
    {
      password: await hashValue(password),
    },
    {
      new: true,
    }
  );
  appAssert(updateUser, INTERNAL_SERVER_ERROR, "Failed to reset password");

  // 3. delete verification code
  await validCode.deleteOne();

  // 4. delete all sessions (force login on all devices)
  await SessionModel.deleteMany({
    userId: updateUser._id,
  });

  // 5. return success message
  return {
    user: updateUser.omitPassword(),
    message: "Password reset successfully",
  };
};
