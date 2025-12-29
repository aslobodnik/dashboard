import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Slobo's Dashboard",
  description: "DoorDash Recovery Tracker - one order at a time",
  openGraph: {
    title: "Slobo's Dashboard",
    description: "DoorDash Recovery Tracker - one order at a time",
    url: "https://dashboard.slobo.xyz",
    siteName: "Slobo's Dashboard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Slobo's Dashboard",
    description: "DoorDash Recovery Tracker - one order at a time",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
