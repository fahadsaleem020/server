import type { Request, Response, NextFunction } from "express";
import { logger } from "@/utils/logger.util";
import { status } from "http-status";

// catches unexpected internal errors
export const globalErrorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  logger.error({ path: req.path, method: req.method, stack: err instanceof Error ? err.stack : err }, "Unexpected Exception");
  res.status(status.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
};
