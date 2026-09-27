import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "PlacExpert-AI | AI-Powered Career Guidance",
  description: "Advanced adaptive roadmap and mock interview platform for career growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-bg text-foreground antialiased min-h-screen">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
