import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createStore, createUser, getDashboardCounts, getDb, getStoreRatings, getUserByEmail, getUserByOpenId, upsertRating, users, stores, ratings } from "./db";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { eq, sql } from "drizzle-orm";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const passwordSchema = z.string().min(8).max(16).regex(/[A-Z]/, "Must include an uppercase letter").regex(/[^A-Za-z0-9]/, "Must include a special character");
const nameSchema = z.string().min(20).max(60);
const addressSchema = z.string().max(400);

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored?: string | null) {
  if (!stored) return false;
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const hashed = scryptSync(password, salt, 64);
  return timingSafeEqual(hashed, Buffer.from(key, "hex"));
}

function safeUser(user: any) {
  if (!user) return user;
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

function assertRole(user: any, roles: string[]) {
  if (!user || !roles.includes(user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this area." });
}

export const appRouter = router({
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: passwordSchema }))
      .mutation(async ({ input }) => {
        const user = await getUserByEmail(input.email);
        if (!user || !verifyPassword(input.password, user.passwordHash)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Email or password is incorrect." });
        }
        return safeUser(user);
      }),
    signup: publicProcedure
      .input(z.object({ name: nameSchema, email: z.string().email(), address: addressSchema, password: passwordSchema }))
      .mutation(async ({ input }) => {
        const existing = await getUserByEmail(input.email);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists." });
        const user = { openId: `local-${createHash("sha256").update(input.email).digest("hex").slice(0, 20)}`, name: input.name, email: input.email.toLowerCase(), address: input.address, passwordHash: hashPassword(input.password), role: "user" as const, loginMethod: "password" };
        const id = await createUser(user);
        return safeUser({ ...user, id: id ?? 0, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() });
      }),
    updatePassword: publicProcedure
      .input(z.object({ userId: z.number(), password: passwordSchema }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: true } as const;
        await db.update(users).set({ passwordHash: hashPassword(input.password), updatedAt: new Date() }).where(eq(users.id, input.userId));
        return { success: true } as const;
      }),
  }),
  stores: router({
    list: publicProcedure
      .input(z.object({ search: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const rows = await db.select({ id: stores.id, name: stores.name, email: stores.email, address: stores.address, ownerId: stores.ownerId, rating: sql<number>`coalesce(avg(${ratings.rating}), 0)`, ratingCount: sql<number>`count(${ratings.id})` }).from(stores).leftJoin(ratings, eq(stores.id, ratings.storeId)).groupBy(stores.id);
        const search = input?.search?.toLowerCase().trim();
        return search ? rows.filter(store => `${store.name} ${store.address}`.toLowerCase().includes(search)) : rows;
      }),
  }),
  ratings: router({
    upsert: protectedProcedure
      .input(z.object({ storeId: z.number(), rating: z.number().int().min(1).max(5) }))
      .mutation(async ({ ctx, input }) => {
        assertRole(ctx.user, ["user"]);
        await upsertRating({ storeId: input.storeId, userId: ctx.user!.id, rating: input.rating });
        return { success: true } as const;
      }),
  }),
  admin: router({
    stats: protectedProcedure.query(async ({ ctx }) => { assertRole(ctx.user, ["admin"]); return getDashboardCounts(); }),
    users: protectedProcedure.query(async ({ ctx }) => {
      assertRole(ctx.user, ["admin"]);
      const db = await getDb();
      return db ? db.select({ id: users.id, name: users.name, email: users.email, address: users.address, role: users.role, createdAt: users.createdAt }).from(users).orderBy(users.name) : [];
    }),
    stores: protectedProcedure.query(async ({ ctx }) => {
      assertRole(ctx.user, ["admin"]);
      const db = await getDb();
      return db ? db.select({ id: stores.id, name: stores.name, email: stores.email, address: stores.address, rating: sql<number>`coalesce(avg(${ratings.rating}), 0)`, ratingCount: sql<number>`count(${ratings.id})` }).from(stores).leftJoin(ratings, eq(stores.id, ratings.storeId)).groupBy(stores.id).orderBy(stores.name) : [];
    }),
    createUser: protectedProcedure.input(z.object({ name: nameSchema, email: z.string().email(), address: addressSchema, password: passwordSchema, role: z.enum(["user", "admin", "storeOwner"]) })).mutation(async ({ ctx, input }) => {
      assertRole(ctx.user, ["admin"]);
      const id = await createUser({ openId: `local-${Date.now()}-${input.email}`, name: input.name, email: input.email.toLowerCase(), address: input.address, passwordHash: hashPassword(input.password), role: input.role, loginMethod: "password" });
      return { id: id ?? 0 };
    }),
    createStore: protectedProcedure.input(z.object({ name: z.string().min(3).max(120), email: z.string().email(), address: addressSchema, ownerId: z.number().optional() })).mutation(async ({ ctx, input }) => {
      assertRole(ctx.user, ["admin"]);
      const id = await createStore(input);
      return { id: id ?? 0 };
    }),
    userDetail: protectedProcedure.input(z.object({ userId: z.number() })).query(async ({ ctx, input }) => {
      assertRole(ctx.user, ["admin"]);
      const db = await getDb();
      if (!db) return null;
      const user = await db.select({ id: users.id, name: users.name, email: users.email, address: users.address, role: users.role }).from(users).where(eq(users.id, input.userId)).limit(1);
      return user[0] ?? null;
    }),
  }),
  owner: router({
    summary: protectedProcedure.query(async ({ ctx }) => {
      assertRole(ctx.user, ["storeOwner"]);
      const db = await getDb();
      if (!db) return { store: null, average: 0, ratings: [] };
      const owned = await db.select().from(stores).where(eq(stores.ownerId, ctx.user!.id)).limit(1);
      if (!owned[0]) return { store: null, average: 0, ratings: [] };
      const entries = await getStoreRatings(owned[0].id);
      return { store: owned[0], average: entries.length ? entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length : 0, ratings: entries };
    }),
  }),
});

export type AppRouter = typeof appRouter;
