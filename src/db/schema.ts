import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// 1. Table untuk Autentikasi (Auth.js)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  role: text("role").default("user"),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
  oauth_token_secret: text("oauth_token_secret"),
  oauth_token: text("oauth_token"),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  sessionToken: text("sessionToken").unique().notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.identifier, table.token] }),
}));

// 2. Table untuk Analytics Pengunjung
export const webAnalytics = sqliteTable("web_analytics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pagePath: text("page_path").notNull(),
  country: text("country").notNull(),
  userAgent: text("user_agent").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const aiChatMessages = sqliteTable("ai_chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' atau 'ai'
  content: text("content").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const softwareTools = sqliteTable("software_tools", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  iconType: text("icon_type").notNull(), // 'iconify' | 'custom_r2'
  iconValue: text("icon_value").notNull(),
  color: text("color"), // HEX code
});

export const albumMetadata = sqliteTable("album_metadata", {
  albumSlug: text("album_slug").primaryKey(),
  title: text("title").notNull(),
  softwareList: text("software_list").notNull(), // JSON string array
});
