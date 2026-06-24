import { describe, expect, it } from "vitest";

import {
  MAX_POST_BODY_LENGTH,
  MAX_POST_IMAGE_COUNT,
  MAX_POST_IMAGE_SIZE_BYTES,
  postInputSchema,
} from "./post";

const image = (overrides?: Partial<File>): File =>
  ({
    name: "trail.jpg",
    size: 1024,
    type: "image/jpeg",
    ...overrides,
  }) as File;

describe("postInputSchema", () => {
  it("accepts body-only post content", () => {
    const result = postInputSchema.safeParse({
      body: "今天走了一条很舒服的山脊线。",
      images: [],
    });

    expect(result.success).toBe(true);
  });

  it("accepts image-only post content", () => {
    const result = postInputSchema.safeParse({
      body: "   ",
      images: [image()],
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty content without images", () => {
    const result = postInputSchema.safeParse({
      body: "   ",
      images: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects body longer than 2000 characters", () => {
    const result = postInputSchema.safeParse({
      body: "徒".repeat(MAX_POST_BODY_LENGTH + 1),
      images: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects more than 9 images", () => {
    const result = postInputSchema.safeParse({
      body: "九图上限测试",
      images: Array.from({ length: MAX_POST_IMAGE_COUNT + 1 }, () => image()),
    });

    expect(result.success).toBe(false);
  });

  it("rejects an image over 10MB", () => {
    const result = postInputSchema.safeParse({
      body: "图片过大测试",
      images: [image({ size: MAX_POST_IMAGE_SIZE_BYTES + 1 })],
    });

    expect(result.success).toBe(false);
  });

  it("rejects non-image files", () => {
    const result = postInputSchema.safeParse({
      body: "文件类型测试",
      images: [image({ type: "application/pdf", name: "route.pdf" })],
    });

    expect(result.success).toBe(false);
  });
});
