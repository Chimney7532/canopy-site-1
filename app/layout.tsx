import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const canopyMono = IBM_Plex_Mono({
  variable: "--font-canopy-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CANOPY",
  description: "CANOPY is the eye that helps you see the forest move.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${canopyMono.variable} h-full bg-[#f4f1ea] antialiased`}
    >
      <body className={`${canopyMono.className} flex min-h-full flex-col overflow-hidden bg-[#f4f1ea]`}>
        {children}
      </body>
    </html>
  );
}
