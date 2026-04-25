import type { NextFunction, Request, Response } from "express";
import { getSession } from "@/utils/getsession.util";
import { logger } from "@/utils/logger.util";
import { status } from "http-status";

export const requireSession = async (req: Request, _: Response, next: NextFunction) => {
  const session = await getSession(req);

  if (session) {
    req.session = session;
    return next();
  }

  logger.error(status[status.UNAUTHORIZED]);
  throw new Error(status[status.UNAUTHORIZED]);
};

export const requireGuest = async (req: Request, _: Response, next: NextFunction) => {
  const session = await getSession(req);

  if (!session) {
    return next();
  }

  logger.error(status[status.UNAUTHORIZED]);
  throw new Error(status[status.UNAUTHORIZED]);
};
