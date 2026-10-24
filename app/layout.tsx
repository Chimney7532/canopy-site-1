import type { Metadata } from "next";
import "./globals.css";
import "./editorial.css";
import "./motion.css";

export const metadata: Metadata = {
  title: "Canopy — Events, people & projects",
  description: "Events, member conversations, ideas and projects at Canopy.",
  icons: {
    icon: [{ url: "/favicon.ico?v=64", sizes: "16x16 32x32 48x48" }, { url: "/favicon.svg?v=64", type: "image/svg+xml", sizes: "any" }],
    shortcut: "/favicon.ico?v=64",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/assets/fonts/space-grotesk-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/fonts/newsreader-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
