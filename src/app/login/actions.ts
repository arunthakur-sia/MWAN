"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE_NAME, getAccessCookieValue, isValidAccessCode } from "@/lib/auth/access";

export interface LoginState {
  error?: string;
}

export async function verifyAccessCode(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const code = String(formData.get("code") ?? "").trim();

  if (!isValidAccessCode(code)) {
    return { error: "invalid" };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE_NAME, getAccessCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/");
}
