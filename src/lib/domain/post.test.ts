import { describe, expect, test } from "vitest";

import { summarizePostBody } from "./post";

describe("summarizePostBody", () => {
  test("keeps body at or below the summary limit", () => {
    expect(summarizePostBody("短动态")).toBe("短动态");
  });

  test("truncates body longer than 100 characters with ellipsis", () => {
    expect(summarizePostBody("徒".repeat(101))).toBe(`${"徒".repeat(100)}…`);
  });
});
