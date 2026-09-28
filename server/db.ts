import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertRating, InsertStore, InsertUser, ratings, stores, users } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return result[0];
}

export async function upsertUser(user: InsertUser) {
  const db = await getDb();
  if (!db) return;
  await db.insert(users).values(user).onDuplicateKeyUpdate({
    set: { name: user.name, email: user.email, lastSignedIn: new Date() },
  });
}

export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(users).values(user);
  return Number(result[0].insertId);
}

export async function createStore(store: InsertStore) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(stores).values(store);
  return Number(result[0].insertId);
}

export async function upsertRating(input: InsertRating) {
  const db = await getDb();
  if (!db) return;
  await db.insert(ratings).values(input).onDuplicateKeyUpdate({
    set: { rating: input.rating, updatedAt: new Date() },
  });
}

export async function getStoreRatings(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ rating: ratings.rating, userId: ratings.userId, createdAt: ratings.createdAt, userName: users.name, userEmail: users.email })
    .from(ratings)
    .innerJoin(users, eq(ratings.userId, users.id))
    .where(eq(ratings.storeId, storeId))
    .orderBy(desc(ratings.createdAt));
}

export async function getDashboardCounts() {
  const db = await getDb();
  if (!db) return { users: 0, stores: 0, ratings: 0 };
  const [userCount, storeCount, ratingCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(stores),
    db.select({ count: sql<number>`count(*)` }).from(ratings),
  ]);
  return {
    users: Number(userCount[0]?.count ?? 0),
    stores: Number(storeCount[0]?.count ?? 0),
    ratings: Number(ratingCount[0]?.count ?? 0),
  };
}

export { and, eq, ratings, stores, users };
