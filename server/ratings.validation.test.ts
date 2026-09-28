import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(role: "user" | "admin" | "storeOwner"): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "test-user",
      name: "A Test User With A Long Enough Name",
      email: "test@example.com",
      passwordHash: null,
      address: "42 Test Avenue",
      loginMethod: "password",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("ratings.upsert", () => {
  it("rejects ratings outside the 1 to 5 range", async () => {
    const caller = appRouter.createCaller(context("user"));
    await expect(caller.ratings.upsert({ storeId: 1, rating: 6 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("only allows normal users to submit ratings", async () => {
    const caller = appRouter.createCaller(context("admin"));
    await expect(caller.ratings.upsert({ storeId: 1, rating: 5 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
