import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/domain/auth";
import { getAvatarDisplay, getCurrentProfile } from "@/lib/domain/profile";
import { getLoginRedirectPath } from "@/lib/domain/navigation";

import { ProfileForm } from "./ProfileForm";

export default async function ProfileSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(getLoginRedirectPath("/settings/profile"));
  }

  const profile = await getCurrentProfile(user.id);

  if (!profile) {
    throw new Error("Profile not found");
  }

  const avatar = getAvatarDisplay(profile);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#e8decb_100%)] px-5 py-10 text-stone-950">
      <section className="mx-auto w-full max-w-4xl border border-stone-900/10 bg-white/72 p-8 shadow-[0_24px_80px_rgba(52,42,28,0.12)] backdrop-blur sm:p-10">
        <div className="flex flex-col gap-6 border-b border-stone-200 pb-8 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#202c22] text-3xl font-semibold text-stone-50">
            {avatar.type === "image" ? profile.nickname.charAt(0) : avatar.value}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Profile</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">编辑个人资料</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              先把昵称和简介打磨清楚。头像暂时使用占位逻辑，后续接入图片上传。
            </p>
          </div>
        </div>

        <ProfileForm profile={profile} />
      </section>
    </main>
  );
}
