import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // User denied access on Google's consent screen
    if (error === "access_denied") {
      return NextResponse.redirect(`${BASE_URL}/?google_error=access_denied`);
    }

    if (!code) {
      return NextResponse.redirect(`${BASE_URL}/?google_error=no_code`);
    }

    // ── Step 1: Exchange authorization code for access token ──
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${BASE_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Google token exchange error:", tokens);
      return NextResponse.redirect(`${BASE_URL}/?google_error=token_exchange_failed`);
    }

    // ── Step 2: Fetch Google user profile ──
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userResponse.json();

    if (!userResponse.ok || !googleUser.email) {
      return NextResponse.redirect(`${BASE_URL}/?google_error=profile_fetch_failed`);
    }

    // ── Step 3: Find or create user in DB ──
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      // New Google user — create account (no password, no username needed)
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name || googleUser.email.split("@")[0],
          image: googleUser.picture || null,
          password: null,
          role: "USER",
          currentDay: 1,
          readinessScore: 0.0,
          streak: 0,
          readinessLevel: "Beginner",
        },
      });
    } else if (googleUser.picture && user.image !== googleUser.picture) {
      // Update profile picture if it changed
      user = await prisma.user.update({
        where: { email: googleUser.email },
        data: { image: googleUser.picture },
      });
    }

    // ── Step 4: Set session cookie (same as email/password login) ──
    const cookieStore = await cookies();
    cookieStore.set("user_email", user.email!, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false,
    });

    // ── Step 5: Redirect — new users → profiling, existing → home ──
    const isNewUser = !user.domainInterest;
    return NextResponse.redirect(`${BASE_URL}${isNewUser ? "/profiling" : "/"}`);

  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(`${BASE_URL}/?google_error=server_error`);
  }
}
