import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("合并普通类名", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("过滤 falsy 值", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("tailwind 冲突类后者覆盖前者", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
