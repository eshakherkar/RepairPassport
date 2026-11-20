/**
 * Email and password rules, shared by the sign-up form (as hints) and the
 * server actions (as the real check). The server always re-checks, because
 * anything in the browser can be bypassed.
 */

export const PASSWORD_MIN_LENGTH = 8;

/** Shown under the password field when signing up. */
export const PASSWORD_RULES = [
  `At least ${PASSWORD_MIN_LENGTH} characters`,
  "At least one letter",
  "At least one number",
];

export function validateEmail(email: string): string | null {
  if (!email) return "Enter your email address.";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address, like name@example.com.";
  }
  return null;
}

/** Returns the first rule the password breaks, or null if it's fine. */
export function validateNewPassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (password.length > 72) {
    // Supabase only uses the first 72 characters of a password.
    return "Use 72 characters or fewer.";
  }
  if (!/[A-Za-z]/.test(password)) return "Include at least one letter.";
  if (!/[0-9]/.test(password)) return "Include at least one number.";
  return null;
}
