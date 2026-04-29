import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface AdminSession {
  userId?: number;
  username?: string;
}

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_PASSWORD ||
    "kastas-default-password-change-me-32-bytes-min!",
  cookieName: "kastas_admin",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  },
};

export async function getSession() {
  const c = await cookies();
  return getIronSession<AdminSession>(c, sessionOptions);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session.userId) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
