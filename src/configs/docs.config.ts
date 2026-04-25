import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { apiReference } from "@scalar/express-api-reference";
import type { OpenAPIOptions } from "better-auth/plugins";
import { env } from "@/utils/env.util";
import z from "zod";

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();

// --- Generate OpenAPI document (only once) ---
const generator = new OpenApiGeneratorV3(registry.definitions);

export const content = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "API Routes",
    version: "1.0.0",
  },
  servers: [{ url: env.BACKEND_DOMAIN }],
});

export const source = apiReference({
  theme: "purple" as OpenAPIOptions["theme"],
  sources: [
    { url: "/api/docs", title: "API", content },
    { url: "/docs/auth", title: "Auth" },
  ],
});
