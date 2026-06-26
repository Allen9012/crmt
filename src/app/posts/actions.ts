"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/domain/auth";
import { softDeletePost } from "@/lib/domain/post";

export async function deletePostAction(formData: FormData) {
  await requireCurrentUser();
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    throw new Error("Post id is required");
  }

  await softDeletePost(id);
  revalidatePath("/");
  redirect("/");
}
