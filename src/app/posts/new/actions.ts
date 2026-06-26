"use server";

import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/domain/auth";
import { createPost } from "@/lib/domain/post";
import { postInputSchema, type PostImageFile } from "@/lib/validation/post";

export type CreatePostActionState = {
  message: string;
};

function getImages(formData: FormData) {
  return formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

export async function createPostAction(
  _state: CreatePostActionState,
  formData: FormData,
): Promise<CreatePostActionState> {
  const user = await requireCurrentUser();
  const images = getImages(formData);
  const parsed = postInputSchema.safeParse({
    body: formData.get("body"),
    images: images as PostImageFile[],
  });

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "请检查动态内容",
    };
  }

  const postId = await createPost({
    body: parsed.data.body,
    images,
    userId: user.id,
  });

  redirect(`/posts/${postId}`);
}
