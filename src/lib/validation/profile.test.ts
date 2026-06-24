import { describe, expect, it } from "vitest";

import { profileSchema } from "./profile";

describe("profileSchema", () => {
  it("accepts a valid nickname and bio", () => {
    const result = profileSchema.safeParse({
      nickname: "山野行者",
      bio: "周末徒步，记录路线见闻。",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty nickname after trimming", () => {
    const result = profileSchema.safeParse({
      nickname: "   ",
      bio: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a nickname longer than 30 characters", () => {
    const result = profileSchema.safeParse({
      nickname: "徒".repeat(31),
      bio: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a bio longer than 200 characters", () => {
    const result = profileSchema.safeParse({
      nickname: "山野行者",
      bio: "徒".repeat(201),
    });

    expect(result.success).toBe(false);
  });
});
