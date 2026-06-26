import { describe, expect, test } from "vitest";

import { authCredentialsSchema } from "./auth";

describe("authCredentialsSchema", () => {
  test("accepts valid email and password", () => {
    const result = authCredentialsSchema.safeParse({
      email: "hiker@example.com",
      password: "secret12",
    });

    expect(result.success).toBe(true);
  });

  test("rejects invalid email", () => {
    const result = authCredentialsSchema.safeParse({
      email: "not-an-email",
      password: "secret12",
    });

    expect(result.success).toBe(false);
  });

  test("rejects password shorter than 6 characters", () => {
    const result = authCredentialsSchema.safeParse({
      email: "hiker@example.com",
      password: "12345",
    });

    expect(result.success).toBe(false);
  });
});
