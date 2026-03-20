import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const runtime = 'edge';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "先知契约 - 社交化预测对赌",
  description: "在朋友圈发起预测与对赌，全场见证。",
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
      <body className="min-h-full flex flex-col relative text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950">
        <div className="absolute top-6 right-6 z-50">
          <UserNav />
        </div>
        {children}
      </body>
    </html>
  );
}
