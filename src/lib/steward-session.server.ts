import { useSession } from "@tanstack/react-start/server";

export async function stewardSession() {
  return useSession<{ unlocked?: boolean }>({
    password: process.env["STEWARD_SESSION_SECRET"]!,
    name: "steward",
    maxAge: 60 * 60 * 24 * 14,
    cookie: { httpOnly: true, secure: true, sameSite: "lax", path: "/" },
  });
}

export async function requireStewardSession() {
  const session = await stewardSession();
  if (!session.data.unlocked) throw new Error("LOCKED");
}