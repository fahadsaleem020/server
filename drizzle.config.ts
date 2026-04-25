import { type Config, defineConfig } from "drizzle-kit";
import { env } from "./src/utils/env.util";

export default defineConfig({
  dbCredentials: {
    url: env.CONNECTION_URL,
  },
  schema: "./src/schema/schema.ts",
  dialect: "postgresql",
}) satisfies Config;
