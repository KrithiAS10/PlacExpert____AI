import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { name, username, email, phone, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing required fields: username, email, or password" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
          { phone: phone || undefined }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }
      if (existingUser.username === username) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
      if (phone && existingUser.phone === phone) {
        return NextResponse.json({ error: "Phone number already registered" }, { status: 400 });
      }
    }

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name: name || username,
        email,
        username,
        phone: phone || null,
        password,
        role: "USER",
        currentDay: 1,
        readinessScore: 0.0,
        streak: 0,
        readinessLevel: "Beginner",
      }
    });

    // Set user_email cookie
    const cookieStore = await cookies();
    cookieStore.set('user_email', newUser.email!, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false, // accessible client-side
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: err.message || "Failed to register user" }, { status: 500 });
  }
}
