import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('user_email');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}
