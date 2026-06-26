import type { SupabaseClient } from "@supabase/supabase-js";

import type { PostImageFile } from "@/lib/validation/post";

export const POST_IMAGE_BUCKET = "images";

type ImagePathInput = {
  userId: string;
  postId: string;
  sortOrder: number;
  file: Pick<PostImageFile, "name" | "type">;
};

const MIME_EXTENSIONS: Record<string, string> = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function getImageExtension(file: Pick<PostImageFile, "name" | "type">) {
  const extensionFromType = MIME_EXTENSIONS[file.type];

  if (extensionFromType) {
    return extensionFromType;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : "bin";
}

export function buildPostImagePath({ userId, postId, sortOrder, file }: ImagePathInput) {
  return `${userId}/${postId}/${sortOrder}.${getImageExtension(file)}`;
}

export async function uploadPostImages(
  supabase: SupabaseClient,
  {
    files,
    postId,
    userId,
  }: {
    files: PostImageFile[];
    postId: string;
    userId: string;
  },
) {
  const uploadedPaths: string[] = [];

  for (const [sortOrder, file] of files.entries()) {
    const path = buildPostImagePath({
      file,
      postId,
      sortOrder,
      userId,
    });
    const { error } = await supabase.storage.from(POST_IMAGE_BUCKET).upload(path, file as File, {
      contentType: file.type || undefined,
      upsert: false,
    });

    if (error) {
      await deletePostImages(supabase, uploadedPaths);
      throw new Error(error.message);
    }

    uploadedPaths.push(path);
  }

  return uploadedPaths;
}

export async function deletePostImages(supabase: SupabaseClient, paths: string[]) {
  if (paths.length === 0) {
    return;
  }

  await supabase.storage.from(POST_IMAGE_BUCKET).remove(paths);
}
