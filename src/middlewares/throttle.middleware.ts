import type { IRateLimiterPostgresOptions, IRateLimiterRes } from "rate-limiter-flexible";
import { RateLimiterMemory, RateLimiterPostgres } from "rate-limiter-flexible";
import { connection, database } from "@/configs/connection.config";
import { throttleinsight } from "@/schema/schema";
import type { RequestHandler } from "express";
import { env } from "@/utils/env.util";
import status from "http-status";

type Throttle = (keyPrefix: string, points: number, duration: number, blockDuration: number, message?: string) => RequestHandler;

// Limiter core configs
const CoreConfigs: Omit<IRateLimiterPostgresOptions, "duration" | "points"> = {
  dbName: env.DATABASE_NAME,
  storeClient: connection,
  tableName: "throttle",
  storeType: "pg",
};

// A cache to store limiters by their "key" (options)
const limitersCache = new Map<string, RateLimiterPostgres>();

export const throttle: Throttle = (keyPrefix, points, duration, blockDuration, message) => {
  const options = { keyPrefix, points, duration, blockDuration };
  const mergedOptions = { ...CoreConfigs, ...options };

  // Get existing limiter or create a new one ONLY if it doesn't exist
  if (!limitersCache.has(keyPrefix)) {
    const newLimiter = new RateLimiterPostgres({
      ...mergedOptions,
      insuranceLimiter: new RateLimiterMemory({
        blockDuration: mergedOptions.blockDuration,
        keyPrefix: mergedOptions.keyPrefix,
        duration: mergedOptions.duration,
        points: mergedOptions.points,
      }),
    });
    limitersCache.set(keyPrefix, newLimiter);
  }

  const limiter = limitersCache.get(keyPrefix)!;

  return async (req, res, next) => {
    // enforcing _(underscore) for better key visibility
    if (!(keyPrefix.split("").at(-1) === "_")) {
      next(new Error('Prefix must end with an "_"(underscore) character e.g: key_'));
    }

    const ip = req.ip || "unknown";
    try {
      await limiter.consume(ip);
      next();
    } catch (rateLimiterRes) {
      if (rateLimiterRes) {
        const { msBeforeNext, consumedPoints, remainingPoints, isFirstInDuration } = rateLimiterRes as Required<IRateLimiterRes>;

        const values = {
          key: ip,
          msBeforeNext,
          consumedPoints,
          remainingPoints,
          reqPath: req.path,
          isFirstInDuration,
          pointsAllotted: limiter.points,
          waitTime: limiter.blockDuration,
        } satisfies typeof throttleinsight.$inferInsert;

        await database.insert(throttleinsight).values(values).onConflictDoUpdate({ target: throttleinsight.key, set: values });
        res.status(status.TOO_MANY_REQUESTS).json({ message: message || "Too many requests" });
      } else {
        next(new Error("Unexpected Failure"));
      }
    }
  };
};
