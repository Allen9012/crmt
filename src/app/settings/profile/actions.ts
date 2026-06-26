"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/domain/auth";
import { updateProfile } from "@/lib/domain/profile";
import { profileSchema } from "@/lib/validation/profile";

export type ProfileActionState = {
  message: string;
};

export async function updateProfileAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = profileSchema.safeParse({
    nickname: formData.get("nickname"),
    bio: formData.get("bio"),
  });

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "请检查资料内容",
    };
  }

  const user = await requireCurrentUser();
  await updateProfile(user.id, parsed.data);
  revalidatePath("/settings/profile");

  return {
    message: "资料已保存",
  };
}
