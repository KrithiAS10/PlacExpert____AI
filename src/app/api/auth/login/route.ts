import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Missing username/email/phone or password" }, { status: 400 });
    }

    // Find user by username, email, or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
          { phone: identifier }
        ]
      }
    });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Set user_email cookie
    const cookieStore = await cookies();
    cookieStore.set('user_email', user.email!, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false, // accessible client-side
    });

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: err.message || "Failed to log in" }, { status: 500 });
  }
}
