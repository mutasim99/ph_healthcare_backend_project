import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import AppError from "../errorHelper/appError";
import status from "http-status";
import { prisma } from "../lib/prisma";

export const checkAuth =
  (...authRoles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    /* Session Token verification */

    const sessionToken = cookieUtils.getCookie(
      req,
      "better-auth.session_token",
    );

    if (!sessionToken) {
      throw new AppError(status.UNAUTHORIZED, "unauthorize access");
    }

    if (sessionToken) {
      const isSessionExists = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (isSessionExists && isSessionExists.user) {
        const user = sessionToken.user;
        const now = new Date();
        const expiresAt = new Date(isSessionExists.expiresAt);
        const createAt = new Date(isSessionExists.createdAt);

        const sessionLifeTime = expiresAt.getTime() - createAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

        if (percentRemaining < 20) {
          res.setHeader("X-Session-Refresh", "true");
          res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
          res.setHeader("X-Time-Remaining", timeRemaining.toString());

          console.log("session Expiring soon!!");
        }
      }
    }
  };
