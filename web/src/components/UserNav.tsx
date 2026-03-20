"use client";

import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { logout } from "@/app/login/actions";

export default function UserNav() {
  const [user, setUser] = useState<{ user_name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user?.user_metadata || null);
      setLoading(false);
    };
    getUser();
  }, []);

  if (loading) {
    return (
      <Link href="/login" className="text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 px-4 py-2 rounded-full transition-transform backdrop-blur-md inline-block">
        登录 / 注册
      </Link>
    );
  }

  return (
    <>
      {user ? (
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
          <Link href="/profile" className="hover:text-indigo-500 transition-colors flex items-center gap-1">
            <span>{user.user_name || user.email?.split('@')[0]}</span> 👋
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
    </>
  );
}
