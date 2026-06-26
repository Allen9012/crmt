"use server";

import { redirect } from "next/navigation";

import { signInWithEmail, signOut, signUpWithEmail } from "@/lib/domain/auth";
import { createClient } from "@/lib/supabase/server";
import { authCredentialsSchema } from "@/lib/validation/auth";

export type AuthActionState = {
  message: string;
};

function getRedirectPath(formData: FormData) {
  const redirectTo = formData.get("redirectTo");

  if (typeof redirectTo !== "string" || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/";
  }

  return redirectTo;
}

export async function registerAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = authCredentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "请检查注册信息",
    };
  }

  const result = await signUpWithEmail(parsed.data.email, parsed.data.password);

  if (!result.ok) {
    return { message: result.message };
  }

  return {
    message: "注册成功，请前往邮箱完成验证后登录",
  };
}

export async function loginAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = authCredentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "请检查登录信息",
    };
  }

  const result = await signInWithEmail(parsed.data.email, parsed.data.password);

  if (!result.ok) {
    return { message: result.message };
  }

  redirect(getRedirectPath(formData));
}

export async function logoutAction() {
  await signOut();
  redirect("/");
}

export async function googleLoginAction(formData: FormData) {
  const supabase = await createClient();
  const redirectTo = getRedirectPath(formData);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
    },
  });

  if (error || !data.url) {
    redirect(`/auth/login?error=${encodeURIComponent("Google 登录暂不可用，请先使用邮箱登录")}`);
  }

  redirect(data.url);
}
