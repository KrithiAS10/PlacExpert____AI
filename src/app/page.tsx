import { cookies } from "next/headers";
import { getUserData } from "@/lib/db-queries";
import { DashboardClient } from "@/components/DashboardClient";

// ── Domain-based YouTube video recommendations ──────────────────────────────
// Just like the roadmap is generated from profiling answers,
// these 3 videos are picked based on the user's domainInterest.
// ─────────────────────────────────────────────────────────────────────────────

type VideoRec = { id: string; title: string; type: string; duration: string; url: string };

const DOMAIN_VIDEOS: Record<string, VideoRec[]> = {
  "Web Development": [
    { id: "wd1", title: "React JS Full Course for Beginners",         type: "VIDEO", duration: "9h",   url: "https://www.youtube.com/watch?v=RVFAyFWO4go" },
    { id: "wd2", title: "Node.js & Express Full Course",              type: "VIDEO", duration: "8h",   url: "https://www.youtube.com/watch?v=Oe421EPjeBE" },
    { id: "wd3", title: "CSS & Tailwind Crash Course for Developers", type: "VIDEO", duration: "1.5h", url: "https://www.youtube.com/watch?v=lCxcTsOHrjo" },
  ],
  "Full Stack": [
    { id: "fs1", title: "Full Stack Web Dev with Next.js & Prisma",  type: "VIDEO", duration: "5h",   url: "https://www.youtube.com/watch?v=wm5gMKuwSYk" },
    { id: "fs2", title: "REST API Design — Node.js & Express",       type: "VIDEO", duration: "2h",   url: "https://www.youtube.com/watch?v=l8WPWK9mS5M" },
    { id: "fs3", title: "PostgreSQL + Prisma ORM Crash Course",      type: "VIDEO", duration: "1.5h", url: "https://www.youtube.com/watch?v=RebA5J-rlwg" },
  ],
  "Data Science": [
    { id: "ds1", title: "Python for Data Science — Full Course",     type: "VIDEO", duration: "12h",  url: "https://www.youtube.com/watch?v=LHBE6Q9XlzI" },
    { id: "ds2", title: "Pandas & NumPy for Beginners",              type: "VIDEO", duration: "3h",   url: "https://www.youtube.com/watch?v=vmEHCJofslg" },
    { id: "ds3", title: "Machine Learning Full Course — Andrew Ng",  type: "VIDEO", duration: "10h",  url: "https://www.youtube.com/watch?v=jGwO_UgTS7I" },
  ],
  "Mobile App": [
    { id: "mb1", title: "React Native Full Course for Beginners",    type: "VIDEO", duration: "6h",   url: "https://www.youtube.com/watch?v=0-S5a0eXPoc" },
    { id: "mb2", title: "Flutter & Dart — Full Beginner Course",     type: "VIDEO", duration: "7h",   url: "https://www.youtube.com/watch?v=VPvVD8t02U8" },
    { id: "mb3", title: "DSA for Mobile Developers",                 type: "VIDEO", duration: "2h",   url: "https://www.youtube.com/watch?v=8hly31xKli0" },
  ],
  "AI/ML": [
    { id: "ai1", title: "Machine Learning A-Z — Hands On",           type: "VIDEO", duration: "11h",  url: "https://www.youtube.com/watch?v=jGwO_UgTS7I" },
    { id: "ai2", title: "Deep Learning Full Course — freeCodeCamp",  type: "VIDEO", duration: "6h",   url: "https://www.youtube.com/watch?v=VyWAvY2CF9c" },
    { id: "ai3", title: "NLP Zero to Hero — TensorFlow",             type: "VIDEO", duration: "4h",   url: "https://www.youtube.com/watch?v=x7X9w_GIm1s" },
  ],
  "Cloud": [
    { id: "cl1", title: "AWS Full Course for Beginners",             type: "VIDEO", duration: "10h",  url: "https://www.youtube.com/watch?v=k1RI5locZE4" },
    { id: "cl2", title: "Docker & Kubernetes Full Course",           type: "VIDEO", duration: "5h",   url: "https://www.youtube.com/watch?v=kTp5xUtcalw" },
    { id: "cl3", title: "System Design for Cloud Architecture",      type: "VIDEO", duration: "2h",   url: "https://www.youtube.com/watch?v=i53Gi_K3o7I" },
  ],
  "Not Decided": [
    { id: "nd1", title: "DSA Full Course — Striver (A to Z)",        type: "VIDEO", duration: "40h",  url: "https://www.youtube.com/watch?v=rZ41y93P2Qo" },
    { id: "nd2", title: "CS Fundamentals: OS, DBMS, CN, OOP",       type: "VIDEO", duration: "6h",   url: "https://www.youtube.com/watch?v=5B-eWGOYzNM" },
    { id: "nd3", title: "System Design Primer — Basics",             type: "VIDEO", duration: "1.5h", url: "https://www.youtube.com/watch?v=i53Gi_K3o7I" },
  ],
};

// Fallback for users who haven't completed profiling yet
const DEFAULT_VIDEOS: VideoRec[] = [
  { id: "d1", title: "DSA Full Course — Striver (A to Z)",           type: "VIDEO", duration: "40h",  url: "https://www.youtube.com/watch?v=rZ41y93P2Qo" },
  { id: "d2", title: "CS Fundamentals: OS, DBMS, CN, OOP",           type: "VIDEO", duration: "6h",   url: "https://www.youtube.com/watch?v=5B-eWGOYzNM" },
  { id: "d3", title: "System Design Interview Crash Course",          type: "VIDEO", duration: "1.5h", url: "https://www.youtube.com/watch?v=i53Gi_K3o7I" },
];

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get("user_email")?.value;
  const user = userEmail ? await getUserData(userEmail) : null;

  // Pick videos ONLY if the user has completed profiling and set domainInterest
  const recommendations = user?.domainInterest
    ? (DOMAIN_VIDEOS[user.domainInterest] ?? DOMAIN_VIDEOS["Not Decided"])
    : [];

  return <DashboardClient user={user} recommendations={recommendations} />;
}
