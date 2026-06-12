import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/7e7769452c20a9a57d8b8d97e820eef282575a10977e7d67271815d9da949971.sqlite",
  },
});
