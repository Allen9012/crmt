import { describe, expect, test } from "vitest";

import { buildPostImagePath, getImageExtension } from "./image";

describe("getImageExtension", () => {
  test("uses mime type as the source of truth", () => {
    expect(getImageExtension({ name: "trail.any", type: "image/jpeg" })).toBe("jpg");
    expect(getImageExtension({ name: "trail.any", type: "image/png" })).toBe("png");
    expect(getImageExtension({ name: "trail.any", type: "image/webp" })).toBe("webp");
  });

  test("falls back to safe file name extension", () => {
    expect(getImageExtension({ name: "trail.avif", type: "" })).toBe("avif");
  });
});

describe("buildPostImagePath", () => {
  test("builds storage path under the user and post prefix", () => {
    expect(
      buildPostImagePath({
        userId: "user-1",
        postId: "post-1",
        sortOrder: 2,
        file: { name: "trail.jpg", type: "image/jpeg" },
      }),
    ).toBe("user-1/post-1/2.jpg");
  });
});
