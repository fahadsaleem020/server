import type { Request, Response, NextFunction } from "express";
import { getIronSession } from "iron-session";
import { logger } from "@/utils/logger.util";
import { env } from "@/utils/env.util";
import { hash, compare } from "bcrypt";
import { join } from "node:path";
import z from "zod";

const sessionSchema = z.object({
  username: z.string().min(1, { error: "username is required" }),
  password: z.string().min(1, { error: "password is required" }),
});

interface Session {
  username: string;
  password: string;
}

async function handleSession(req: Request, res: Response, payload?: Partial<Session>) {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieLife = 60 * 60 * 24; // 24 hours

  const session = await getIronSession<Session>(req, res, {
    cookieName: "_authenticate",
    password: env.COOKIE_SECRET,
    ttl: cookieLife,
    cookieOptions: {
      httpOnly: true,
      secure: isProduction, // false in local dev, true in prod
      sameSite: isProduction ? "none" : "lax", // "none" for cross-domain prod, "lax" for dev
      maxAge: cookieLife,
      path: "/",
    },
  });

  if (payload?.username && payload?.password) {
    session.username = payload.username;
    session.password = await hash(payload.password, 10);
    await session.save();
  }

  if (session.username && session.password) return session;
  else null;
}

const verifyUser = async (payload: Session, whiteList: Record<string, string>) => {
  const { username, password } = payload;
  if (username in whiteList && ((await compare(whiteList[username], password)) || whiteList[username] === password)) return true;
  logger.error("invalid username or password");
  return false;
};

export const guardBasic = (whiteList: Record<string, string>) => async (req: Request, res: Response, next: NextFunction) => {
  const session = await handleSession(req, res);

  // If session already exists, allow through
  if (session && (await verifyUser(session, whiteList))) {
    return next();
  }

  // Validate incoming credentials
  const { success, data } = sessionSchema.safeParse(req.body);
  if (success && (await verifyUser(data, whiteList))) {
    await handleSession(req, res, data); // create session
    return next();
  } else logger.error("validation failed");

  // Fallback: show auth page
  const filePath = join(process.cwd(), "public", "auth.html");
  return res.sendFile(filePath);
};
