import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@/lib/db/schema";

const pool = new pg.Pool({
  connectionString: (import.meta.env?.DB_URL || process.env.DB_URL) as string,
});

export const db = drizzle(pool, { schema });
