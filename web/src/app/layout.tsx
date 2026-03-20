import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/login/actions";
import Link from "next/link";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950">
        <div className="absolute top-6 right-6 z-50">
          {user ? (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
              <Link href="/profile" className="hover:text-indigo-500 transition-colors flex items-center gap-1">
                <span>{user.user_metadata?.user_name || user.email?.split('@')[0]}</span> 👋
              </Link>
              <div className="w-[1px] h-3 bg-slate-300 dark:bg-slate-700"></div>
              <form action={logout}>
                <button type="submit" className="text-red-500 hover:text-red-600 transition-colors py-0.5">退出</button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 px-4 py-2 rounded-full transition-transform backdrop-blur-md inline-block">
              登录 / 注册
            </Link>
          )}
        </div>
        {children}
      </body>
    </html>
  );
}
