import { describe, expect, test } from "vitest";

import { mapAuthErrorMessage } from "./auth";

describe("mapAuthErrorMessage", () => {
  test("maps duplicate email errors to a clear register hint", () => {
    expect(mapAuthErrorMessage("User already registered")).toBe("该邮箱已注册，请直接登录");
  });

  test("maps invalid credentials errors to a clear login hint", () => {
    expect(mapAuthErrorMessage("Invalid login credentials")).toBe("邮箱或密码不正确");
  });

  test("maps unconfirmed email errors to a verification hint", () => {
    expect(mapAuthErrorMessage("Email not confirmed")).toBe("请先前往邮箱完成验证");
  });

  test("keeps a safe fallback for unknown errors", () => {
    expect(mapAuthErrorMessage("Something unexpected")).toBe("操作失败，请稍后重试");
  });
});
