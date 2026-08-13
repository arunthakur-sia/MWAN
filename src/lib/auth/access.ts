import { createHmac, timingSafeEqual } from "crypto";

export const ACCESS_COOKIE_NAME = "mwan_access";

// The cookie can't just store the access code (or a fixed "granted" string) —
// anyone could set it by hand without ever knowing ACCESS_CODE. Signing it
// with ACCESS_CODE as the HMAC key means forging a valid cookie requires the
// secret itself, not just knowledge that a cookie is being checked.
function signature(): string {
  const secret = process.env.ACCESS_CODE ?? "";
  return createHmac("sha256", secret).update("granted").digest("hex");
}

export function isValidAccessCode(code: string): boolean {
  return code.length > 0 && code === process.env.ACCESS_CODE;
}

export function getAccessCookieValue(): string {
  return signature();
}

export function hasValidAccessCookie(value: string | undefined): boolean {
  if (!value) return false;
  const expected = Buffer.from(signature());
  const actual = Buffer.from(value);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
