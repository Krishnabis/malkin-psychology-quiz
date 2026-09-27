import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Malkin's Psychology NET Quiz 🐰",
  description: "A cute and cozy Psychology NET quiz app for Malkin! Test your knowledge with adorable vibes ✨",
  keywords: ["psychology", "NET", "quiz", "UGC NET", "psychology exam"],
  openGraph: {
    title: "Malkin's Psychology NET Quiz 🐰",
    description: "A cute psychology quiz app to ace your NET exam!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
