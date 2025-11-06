import { defineConfig, env } from "prisma/config";
import "dotenv/config";

const database_url = process.env.DATABASE_URL;

if (!database_url) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: database_url,
  },
});
