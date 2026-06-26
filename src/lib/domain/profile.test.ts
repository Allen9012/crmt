import { describe, expect, test } from "vitest";

import { getAvatarDisplay, mapProfileRow } from "./profile";

describe("mapProfileRow", () => {
  test("maps nullable profile columns to a stable profile shape", () => {
    expect(
      mapProfileRow({
        id: "user-1",
        nickname: "山野行者",
        bio: null,
        avatar_path: null,
        created_at: "2026-06-26T00:00:00.000Z",
        updated_at: "2026-06-26T00:00:00.000Z",
      }),
    ).toEqual({
      id: "user-1",
      nickname: "山野行者",
      bio: "",
      avatarPath: null,
      createdAt: "2026-06-26T00:00:00.000Z",
      updatedAt: "2026-06-26T00:00:00.000Z",
    });
  });
});

describe("getAvatarDisplay", () => {
  test("uses avatar path when present", () => {
    expect(getAvatarDisplay({ nickname: "山野行者", avatarPath: "avatars/user-1.png" })).toEqual({
      type: "image",
      value: "avatars/user-1.png",
    });
  });

  test("falls back to first nickname character", () => {
    expect(getAvatarDisplay({ nickname: "山野行者", avatarPath: null })).toEqual({
      type: "placeholder",
      value: "山",
    });
  });
});
