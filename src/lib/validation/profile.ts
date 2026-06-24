import { z } from "zod";

export const PROFILE_NICKNAME_MAX_LENGTH = 30;
export const PROFILE_BIO_MAX_LENGTH = 200;

export const profileSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, "昵称不能为空")
    .max(PROFILE_NICKNAME_MAX_LENGTH, "昵称不能超过 30 个字符"),
  bio: z.string().trim().max(PROFILE_BIO_MAX_LENGTH, "简介不能超过 200 个字符"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
