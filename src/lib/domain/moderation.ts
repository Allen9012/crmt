export type ModerationContext = {
  body: string;
  imagePaths: string[];
  userId: string;
};

export type ModerationResult =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      reason: string;
    };

export type ModerationHandler = (
  context: ModerationContext,
) => Promise<ModerationResult> | ModerationResult;

export async function moderateContent(
  context: ModerationContext,
  handlers: ModerationHandler[] = [],
): Promise<ModerationResult> {
  for (const handler of handlers) {
    const result = await handler(context);

    if (!result.allowed) {
      return result;
    }
  }

  return { allowed: true };
}
