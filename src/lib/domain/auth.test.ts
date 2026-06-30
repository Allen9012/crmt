import { beforeEach, describe, expect, test, vi } from "vitest";

import { mapAuthErrorMessage } from "./auth";

const supabaseMock = vi.hoisted(() => {
  const single = vi.fn();
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  const upsert = vi.fn(() => ({ select }));
  const from = vi.fn((table: string) => {
    if (table === "profiles") {
      return { upsert, select };
    }

    return { insert, select };
  });
  const createUser = vi.fn();

  return {
    createUser,
    from,
    insert,
    select,
    single,
    upsert,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
  })),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        createUser: supabaseMock.createUser,
      },
    },
    from: supabaseMock.from,
  })),
}));

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

  test("maps signup database errors to a register service hint", () => {
    expect(mapAuthErrorMessage("Database error saving new user")).toBe(
      "注册服务暂不可用，请稍后重试",
    );
  });

  test("keeps a safe fallback for unknown errors", () => {
    expect(mapAuthErrorMessage("Something unexpected")).toBe("操作失败，请稍后重试");
  });
});

describe("signUpWithEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.createUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "trail@example.com",
        },
      },
      error: null,
    });
    supabaseMock.single.mockResolvedValue({
      data: null,
      error: null,
    });
  });

  test("creates a confirmed auth user and closes profile setup in application code", async () => {
    const { signUpWithEmail } = await import("./auth");

    const result = await signUpWithEmail("trail@example.com", "secret123");

    expect(result).toEqual({ ok: true });
    expect(supabaseMock.createUser).toHaveBeenCalledWith({
      email: "trail@example.com",
      password: "secret123",
      email_confirm: true,
    });
    expect(supabaseMock.from).toHaveBeenCalledWith("profiles");
    expect(supabaseMock.upsert).toHaveBeenCalledWith(
      {
        id: "user-1",
        nickname: "trail",
      },
      { onConflict: "id" },
    );
    expect(supabaseMock.from).toHaveBeenCalledWith("operation_audit_logs");
    expect(supabaseMock.insert).toHaveBeenCalledWith({
      table_schema: "public",
      table_name: "profiles",
      record_id: "user-1",
      action: "create",
      actor_id: "user-1",
      actor_role: "service_role",
      old_data: null,
      new_data: {
        id: "user-1",
        nickname: "trail",
      },
    });
  });
});
