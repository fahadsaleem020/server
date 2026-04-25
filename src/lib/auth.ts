import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { database } from "../configs/connection.config";
import { openAPI } from "better-auth/plugins";
import * as schema from "@/schema/schema";
import { betterAuth } from "better-auth";
import { env } from "@/utils/env.util";

const isProduction = process.env.NODE_ENV === "production";
export const auth = betterAuth({
  plugins: [openAPI({ theme: "purple" })],
  database: drizzleAdapter(database, { provider: "pg", schema }),
  trustedOrigins: [env.FRONTEND_DOMAIN],
  secret: env.COOKIE_SECRET,
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days ( session expiry )
    updateAge: 60 * 60 * 24, // 1 day( "expiresIn = now + expiry" after every updateAge time, if session is used )
    cookieCache: {
      enabled: false, // Enable caching session in cookie
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    useSecureCookies: isProduction, // required for HTTPS domains
    cookies: {
      session_token: {
        attributes: {
          sameSite: isProduction ? "none" : "lax",
          httpOnly: true,
          secure: isProduction,
        },
      },
    },
  },
  // signup/signin/reset-password
  emailAndPassword: {
    sendResetPassword: async () => {
      // Send reset password email
    },
    requireEmailVerification: false,
    maxPasswordLength: 10,
    minPasswordLength: 8,
    autoSignIn: true,
    enabled: true,
  },
  emailVerification: {
    sendVerificationEmail: async () => {
      // Send verification email to user
    },
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
  },
  user: {
    modelName: "users",
    additionalFields: {
      imagePublicId: {
        type: "string",
        required: false,
        fieldName: "image_public_id",
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async () => {
        // Send change email verification
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async () => {
        // Send delete account verification
      },
      beforeDelete: async () => {
        // Perform actions before user deletion
      },
      afterDelete: async () => {
        // Perform cleanup after user deletion
      },
    },
  },
});
