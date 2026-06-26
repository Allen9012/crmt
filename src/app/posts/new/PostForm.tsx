"use client";

import { ImagePlus } from "lucide-react";
import { useActionState } from "react";

import { createPostAction, type CreatePostActionState } from "./actions";

const initialState: CreatePostActionState = {
  message: "",
};

export function PostForm() {
  const [state, formAction, isPending] = useActionState(createPostAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <label className="block">
        <span className="text-sm font-medium text-stone-700">正文</span>
        <textarea
          className="mt-2 min-h-44 w-full resize-y border border-stone-300 bg-white/80 px-3 py-3 text-sm leading-6 text-stone-950 outline-none transition focus:border-stone-900"
          name="body"
          maxLength={2000}
          placeholder="写下路线、天气、路况、装备或某个值得记住的瞬间。"
        />
      </label>

      <label className="block border border-dashed border-stone-300 bg-white/60 p-5">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-stone-700">
          <ImagePlus className="h-4 w-4" />
          上传图片
        </span>
        <input className="mt-4 block w-full text-sm text-stone-700" name="images" type="file" accept="image/*" multiple />
        <span className="mt-3 block text-xs leading-5 text-stone-500">最多 9 张，每张不超过 10MB。</span>
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
        {isPending ? "发布中..." : "发布动态"}
      </button>
    </form>
  );
}
