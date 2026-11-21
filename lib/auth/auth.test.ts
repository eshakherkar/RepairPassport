import { describe, expect, it } from "vitest";
import { isProtectedPath, safeNextPath } from "./routes";
import { validateEmail, validateNewPassword } from "./validation";

describe("safeNextPath", () => {
  it("keeps paths on this site", () => {
    expect(safeNextPath("/appliances/123")).toBe("/appliances/123");
  });

  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "dashboard", 42, null])(
    "sends %j to the dashboard instead (no open redirects)",
    (value) => {
      expect(safeNextPath(value)).toBe("/dashboard");
    },
  );
});

describe("isProtectedPath", () => {
  it("protects app pages but not look-alikes", () => {
    expect(isProtectedPath("/appliances/new")).toBe(true);
    expect(isProtectedPath("/repairs")).toBe(true);
    expect(isProtectedPath("/reset-password")).toBe(true);
    expect(isProtectedPath("/appliancesxyz")).toBe(false);
    expect(isProtectedPath("/")).toBe(false);
  });
});

describe("sign-up rules", () => {
  it("checks passwords: 8–72 characters with a letter and a number", () => {
    expect(validateNewPassword("abc12345")).toBeNull();
    expect(validateNewPassword("abc1234")).not.toBeNull();
    expect(validateNewPassword("abcdefgh")).not.toBeNull();
    expect(validateNewPassword("12345678")).not.toBeNull();
    expect(validateNewPassword(`a1${"x".repeat(71)}`)).not.toBeNull();
  });

  it("checks email addresses", () => {
    expect(validateEmail("name@example.com")).toBeNull();
    expect(validateEmail("")).not.toBeNull();
    expect(validateEmail("name@example")).not.toBeNull();
  });
});
