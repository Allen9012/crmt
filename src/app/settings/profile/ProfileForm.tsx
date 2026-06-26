"use client";

import { useActionState } from "react";

import type { Profile } from "@/lib/domain/profile";

import { updateProfileAction, type ProfileActionState } from "./actions";

const initialState: ProfileActionState = {
  message: "",
};

type ProfileFormProps = {
  profile: Profile;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <label className="block">
        <span className="text-sm font-medium text-stone-700">昵称</span>
        <input
          className="mt-2 h-11 w-full border border-stone-300 bg-white/80 px-3 text-sm text-stone-950 outline-none transition focus:border-stone-900"
          name="nickname"
          defaultValue={profile.nickname}
          maxLength={30}
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-stone-700">简介</span>
        <textarea
          className="mt-2 min-h-32 w-full resize-y border border-stone-300 bg-white/80 px-3 py-3 text-sm leading-6 text-stone-950 outline-none transition focus:border-stone-900"
          name="bio"
          defaultValue={profile.bio}
          maxLength={200}
          placeholder="写一点你的徒步偏好、常去城市或路线风格。"
        />
      </label>

      {state.message ? (
        <p className="border border-stone-200 bg-stone-50 px-3 py-2 text-sm leading-6 text-stone-700">
          {state.message}
        </p>
      ) : null}

      <button
        className="inline-flex h-11 items-center justify-center rounded-full bg-stone-950 px-5 text-sm font-medium text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "保存中..." : "保存资料"}
      </button>
    </form>
  );
}
