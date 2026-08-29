import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import { success } from "better-auth";
import status from "http-status";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
  }
  res.status(status.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
};
