import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PerformanceMonitor } from "@/components/providers/PerformanceMonitor";
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
  title: "Logged",
  description: "당신의 영화 취향을 기록하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PerformanceMonitor />
        {children}
      </body>
    </html>
  );
}
