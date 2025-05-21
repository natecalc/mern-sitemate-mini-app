import { ErrorRequestHandler, Response } from "express";
import { NODE_ENV } from "../constants/env";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z } from "zod";
import { AppError } from "../utils/appError";

const handleZodError = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));
  res.status(BAD_REQUEST).json({
    message: error.message,
    errors,
  });
};

const handleAppError = (
  res: Response,
  { statusCode, message, errorCode }: AppError
) => {
  res.status(statusCode).json({
    message,
    errorCode,
  });
};

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log(`PATH: ${req.path}`, error);

  if (error instanceof z.ZodError) {
    handleZodError(res, error);
    return;
  }

  if (error instanceof AppError) {
    handleAppError(res, error);
    return;
  }

  res.status(INTERNAL_SERVER_ERROR).send({
    status: "error",
    message: error.message,
    stack: NODE_ENV === "production" ? null : error.stack,
  });
};

export default errorHandler;
