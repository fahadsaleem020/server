import { type SignOptions, sign, verify } from "jsonwebtoken";
import { env } from "./env.util";

export const generateJwt = (payload: any, expiresIn?: SignOptions["expiresIn"]) => {
  return sign(payload, env.JWT_SECRET, {
    expiresIn: expiresIn ?? 5 * 60,
  });
};

export const verifyJwt = <T = { [p in string]: any }>(token: string) => {
  return verify(token, env.JWT_SECRET) as T;
};
