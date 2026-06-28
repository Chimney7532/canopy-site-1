import type { Metadata } from "next";
import { Instrument_Sans, Newsreader } from "next/font/google";
import "./globals.css";

const canopySans = Instrument_Sans({
  variable: "--font-canopy-sans",
  subsets: ["latin"],
});

const canopySerif = Newsreader({
  variable: "--font-canopy-serif",
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
      className={`${canopySans.variable} ${canopySerif.variable} h-full bg-[#f4f1ea] antialiased`}
    >
      <body className={`${canopySans.className} flex min-h-full flex-col overflow-hidden bg-[#f4f1ea]`}>
        {children}
      </body>
    </html>
  );
}
