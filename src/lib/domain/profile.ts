import { createClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileInput } from "@/lib/validation/profile";

export type ProfileRow = {
  id: string;
  nickname: string;
  bio: string | null;
  avatar_path: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  nickname: string;
  bio: string;
  avatarPath: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AvatarDisplay =
  | {
      type: "image";
      value: string;
    }
  | {
      type: "placeholder";
      value: string;
    };

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    nickname: row.nickname,
    bio: row.bio ?? "",
    avatarPath: row.avatar_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getAvatarDisplay(profile: Pick<Profile, "nickname" | "avatarPath">): AvatarDisplay {
  if (profile.avatarPath) {
    return {
      type: "image",
      value: profile.avatarPath,
    };
  }

  return {
    type: "placeholder",
    value: profile.nickname.trim().charAt(0) || "山",
  };
}

export async function getProfile(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapProfileRow(data as ProfileRow) : null;
}

export async function getCurrentProfile(userId: string): Promise<Profile | null> {
  return getProfile(userId);
}

export async function updateProfile(userId: string, input: ProfileInput): Promise<Profile> {
  const parsed = profileSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      nickname: parsed.nickname,
      bio: parsed.bio,
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProfileRow(data as ProfileRow);
}
