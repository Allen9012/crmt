import { describe, expect, it, vi } from "vitest";

import { moderateContent, type ModerationHandler } from "./moderation";

describe("moderateContent", () => {
  it("allows content when the handler chain is empty", async () => {
    const result = await moderateContent({
      body: "山顶风很大。",
      imagePaths: [],
      userId: "user-1",
    });

    expect(result).toEqual({ allowed: true });
  });

  it("stops at the first rejecting handler", async () => {
    const reject: ModerationHandler = vi.fn(async () => ({
      allowed: false,
      reason: "blocked",
    }));
    const next: ModerationHandler = vi.fn(async () => ({ allowed: true as const }));

    const result = await moderateContent(
      {
        body: "待审核内容",
        imagePaths: [],
        userId: "user-1",
      },
      [reject, next],
    );

    expect(result).toEqual({ allowed: false, reason: "blocked" });
    expect(reject).toHaveBeenCalledOnce();
    expect(next).not.toHaveBeenCalled();
  });

  it("allows callers to add a handler without changing the caller contract", async () => {
    const handler: ModerationHandler = async (context) => ({
      allowed: context.body.includes("徒步"),
      reason: "missing hiking context",
    });

    const result = await moderateContent(
      {
        body: "周末徒步记录",
        imagePaths: [],
        userId: "user-1",
      },
      [handler],
    );

    expect(result).toEqual({ allowed: true });
  });
});
