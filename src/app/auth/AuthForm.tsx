"use client";

import { useActionState } from "react";

import type { AuthActionState } from "./actions";

type AuthFormProps = {
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  buttonLabel: string;
  defaultMessage?: string;
  redirectTo?: string;
};

const initialState: AuthActionState = {
  message: "",
};

export function AuthForm({ action, buttonLabel, defaultMessage, redirectTo }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const message = state.message || defaultMessage;

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo ?? "/"} />

      <label className="block">
        <span className="text-sm font-medium text-stone-700">邮箱</span>
        <input
          className="mt-2 h-11 w-full border border-stone-300 bg-white/80 px-3 text-sm text-stone-950 outline-none transition focus:border-stone-900"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-stone-700">密码</span>
        <input
          className="mt-2 h-11 w-full border border-stone-300 bg-white/80 px-3 text-sm text-stone-950 outline-none transition focus:border-stone-900"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          placeholder="至少 6 个字符"
        />
      </label>

      {message ? (
        <p className="border border-stone-200 bg-stone-50 px-3 py-2 text-sm leading-6 text-stone-700">{message}</p>
      ) : null}

      <button
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-stone-950 px-4 text-sm font-medium text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "提交中..." : buttonLabel}
      </button>
    </form>
  );
}
