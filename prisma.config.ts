import { config } from "dotenv";
import { defineConfig } from "prisma/config";
import { resolveDatabaseUrl } from "./lib/database-url";

config({ path: ".env.local" });

const directUrl = process.env.DIRECT_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: directUrl ? resolveDatabaseUrl(directUrl) : "",
  },
});