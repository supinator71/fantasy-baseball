import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || "complex_password_at_least_32_characters_long",
  cookieName: "batflip_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function POST(request) {
  const session = await getIronSession(await cookies(), sessionOptions);
  session.destroy();
  return NextResponse.json({ ok: true });
}
