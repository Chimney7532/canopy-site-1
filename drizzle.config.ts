import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./.tmp/drizzle",
  schema: "./db/schema.ts",
  dialect: "sqlite",
});
