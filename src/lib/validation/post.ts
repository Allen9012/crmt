import { z } from "zod";

export const MAX_POST_BODY_LENGTH = 2000;
export const MAX_POST_IMAGE_COUNT = 9;
export const MAX_POST_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export type PostImageFile = {
  name: string;
  size: number;
  type: string;
};

const postImageFileSchema = z
  .custom<PostImageFile>(
    (value) =>
      typeof value === "object" &&
      value !== null &&
      "name" in value &&
      "size" in value &&
      "type" in value,
    "图片文件无效",
  )
  .refine((file) => file.type.startsWith("image/"), "只支持图片文件")
  .refine((file) => file.size <= MAX_POST_IMAGE_SIZE_BYTES, "单张图片不能超过 10MB");

export const postInputSchema = z
  .object({
    body: z.string().max(MAX_POST_BODY_LENGTH, "正文不能超过 2000 个字符"),
    images: z.array(postImageFileSchema).max(MAX_POST_IMAGE_COUNT, "每条动态最多上传 9 张图片"),
  })
  .refine(
    ({ body, images }) => body.trim().length > 0 || images.length > 0,
    "正文和图片不能同时为空",
  );

export type PostInput = z.infer<typeof postInputSchema>;
