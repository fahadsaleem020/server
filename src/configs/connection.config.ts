import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "@/schema/schema";
import { env } from "@/utils/env.util";
import { Pool } from "pg";

export const connection = new Pool({ connectionString: env.CONNECTION_URL });
export const database = drizzle(connection, { casing: "snake_case", schema });

export const migrateSchema = async (db: NodePgDatabase<Record<string, unknown>>) => await migrate(db, { migrationsFolder: "drizzle" });
