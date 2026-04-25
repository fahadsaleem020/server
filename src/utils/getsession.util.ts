import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/lib/auth";

export const getSession = async <T extends { headers: any }>(req: T) =>
  await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
