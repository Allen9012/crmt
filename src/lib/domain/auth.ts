import type { User } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AuthResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

export function mapAuthErrorMessage(message?: string | null) {
  const normalized = message?.toLowerCase() ?? "";

  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "该邮箱已注册，请直接登录";
  }

  if (normalized.includes("invalid login credentials")) {
    return "邮箱或密码不正确";
  }

  if (normalized.includes("email not confirmed") || normalized.includes("not confirmed")) {
    return "请先前往邮箱完成验证";
  }

  if (normalized.includes("database error saving new user")) {
    return "注册服务暂不可用，请稍后重试";
  }

  return "操作失败，请稍后重试";
}

function logAuthError(
  operation: string,
  error: { message: string; status?: number; code?: string },
) {
  console.error("Supabase auth operation failed", {
    operation,
    status: error.status,
    code: error.code,
    message: error.message,
  });
}

function getDefaultNickname(email: string) {
  return email.split("@")[0]?.trim().slice(0, 30) || "hiker";
}

async function deleteCreatedUser(userId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    logAuthError("deleteCreatedUser", error);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  return user;
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    logAuthError("signUpWithEmail", error);

    return {
      ok: false,
      message: mapAuthErrorMessage(error.message),
    };
  }

  if (!data.user) {
    return {
      ok: false,
      message: "注册服务暂不可用，请稍后重试",
    };
  }

  const userId = data.user.id;
  const nickname = getDefaultNickname(data.user.email ?? email);
  const profilePayload = {
    id: userId,
    nickname,
  };

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" })
    .select("*")
    .single();

  if (profileError) {
    logAuthError("createProfileForRegisteredUser", profileError);
    await deleteCreatedUser(userId);

    return {
      ok: false,
      message: "注册服务暂不可用，请稍后重试",
    };
  }

  const { error: auditError } = await supabase.from("operation_audit_logs").insert({
    table_schema: "public",
    table_name: "profiles",
    record_id: userId,
    action: "create",
    actor_id: userId,
    actor_role: "service_role",
    old_data: null,
    new_data: profilePayload,
  });

  if (auditError) {
    logAuthError("recordRegisteredProfileAudit", auditError);
    await deleteCreatedUser(userId);

    return {
      ok: false,
      message: "注册服务暂不可用，请稍后重试",
    };
  }

  return { ok: true };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logAuthError("signInWithEmail", error);

    return {
      ok: false,
      message: mapAuthErrorMessage(error.message),
    };
  }

  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
