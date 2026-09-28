import {
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: varchar("name", { length: 60 }),
    email: varchar("email", { length: 320 }),
    passwordHash: varchar("passwordHash", { length: 255 }),
    address: varchar("address", { length: 400 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin", "storeOwner"]).default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  table => ({ emailUnique: unique("users_email_unique").on(table.email) }),
);

export const stores = mysqlTable("stores", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  address: varchar("address", { length: 400 }).notNull(),
  ownerId: int("ownerId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const ratings = mysqlTable(
  "ratings",
  {
    id: int("id").autoincrement().primaryKey(),
    storeId: int("storeId").notNull(),
    userId: int("userId").notNull(),
    rating: int("rating").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ oneRatingPerUser: unique("ratings_store_user_unique").on(table.storeId, table.userId) }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;
