import { createClient } from "@/lib/supabase/server";
import { postInputSchema } from "@/lib/validation/post";

import { deletePostImages, uploadPostImages } from "./image";
import { moderateContent } from "./moderation";

export const POST_SUMMARY_LENGTH = 100;
export const DEFAULT_POST_PAGE_SIZE = 20;

export type PostAuthor = {
  id: string;
  nickname: string;
  avatarPath: string | null;
};

export type PostImage = {
  id: string;
  storagePath: string;
  sortOrder: number;
};

export type Post = {
  id: string;
  authorId: string;
  body: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor | null;
  images: PostImage[];
};

type PostRow = {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  profiles:
    | {
        id: string;
        nickname: string;
        avatar_path: string | null;
      }
    | {
        id: string;
        nickname: string;
        avatar_path: string | null;
      }[]
    | null;
  post_images:
    | {
        id: string;
        storage_path: string;
        sort_order: number;
      }[]
    | null;
};

export function summarizePostBody(body: string) {
  return body.length > POST_SUMMARY_LENGTH ? `${body.slice(0, POST_SUMMARY_LENGTH)}…` : body;
}

function mapPostRow(row: PostRow): Post {
  const images = Array.isArray(row.post_images) ? row.post_images : [];
  const author = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

  return {
    id: row.id,
    authorId: row.author_id,
    body: row.body,
    summary: summarizePostBody(row.body),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: author
      ? {
          id: author.id,
          nickname: author.nickname,
          avatarPath: author.avatar_path,
        }
      : null,
    images: images.map((image) => ({
      id: image.id,
      storagePath: image.storage_path,
      sortOrder: image.sort_order,
    })),
  };
}

const postSelect = `
  id,
  author_id,
  body,
  created_at,
  updated_at,
  profiles:author_id (
    id,
    nickname,
    avatar_path
  ),
  post_images (
    id,
    storage_path,
    sort_order
  )
`;

export async function createPost({
  body,
  images,
  userId,
}: {
  body: string;
  images: File[];
  userId: string;
}) {
  const parsed = postInputSchema.parse({ body, images });
  const supabase = await createClient();
  const postId = crypto.randomUUID();
  const imagePaths = await uploadPostImages(supabase, {
    files: parsed.images,
    postId,
    userId,
  });
  const moderation = await moderateContent({
    body: parsed.body,
    imagePaths,
    userId,
  });

  if (!moderation.allowed) {
    await deletePostImages(supabase, imagePaths);
    throw new Error(moderation.reason);
  }

  const { error: postError } = await supabase.from("posts").insert({
    id: postId,
    author_id: userId,
    body: parsed.body.trim(),
    meta: {},
  });

  if (postError) {
    await deletePostImages(supabase, imagePaths);
    throw new Error(postError.message);
  }

  if (imagePaths.length > 0) {
    const { error: imagesError } = await supabase.from("post_images").insert(
      imagePaths.map((storagePath, sortOrder) => ({
        post_id: postId,
        storage_path: storagePath,
        sort_order: sortOrder,
      })),
    );

    if (imagesError) {
      await supabase.from("posts").update({ deleted_at: new Date().toISOString() }).eq("id", postId);
      await deletePostImages(supabase, imagePaths);
      throw new Error(imagesError.message);
    }
  }

  return postId;
}

export async function listPosts({
  limit = DEFAULT_POST_PAGE_SIZE,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
} = {}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(postSelect)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .order("sort_order", { referencedTable: "post_images", ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as PostRow[]).map(mapPostRow);
}

export async function listMyPosts(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(postSelect)
    .eq("author_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .order("sort_order", { referencedTable: "post_images", ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as PostRow[]).map(mapPostRow);
}

export async function getPost(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(postSelect)
    .eq("id", id)
    .is("deleted_at", null)
    .order("sort_order", { referencedTable: "post_images", ascending: true })
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapPostRow(data as unknown as PostRow) : null;
}

export async function softDeletePost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").update({ deleted_at: new Date().toISOString() }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
