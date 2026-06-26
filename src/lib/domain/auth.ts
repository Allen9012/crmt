import type { User } from "@supabase/supabase-js";

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

  return "操作失败，请稍后重试";
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
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return {
      ok: false,
      message: mapAuthErrorMessage(error.message),
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
