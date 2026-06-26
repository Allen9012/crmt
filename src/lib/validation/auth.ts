import { z } from "zod";

export const AUTH_PASSWORD_MIN_LENGTH = 6;

export const authCredentialsSchema = z.object({
  email: z.string().trim().email("请输入有效邮箱"),
  password: z
    .string()
    .min(AUTH_PASSWORD_MIN_LENGTH, "密码至少需要 6 个字符"),
});

export type AuthCredentialsInput = z.infer<typeof authCredentialsSchema>;
