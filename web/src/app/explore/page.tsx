"use client";

import Link from "next/link";
import { Users, Clock, ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Explore() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('predictions')
        .select(`
          id,
          title,
          deadline,
          status,
          profiles (username, avatar_url),
          votes (id)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching predictions:', error.message);
      } else if (data) {
        const formatted = data.map((p: any) => {
          const target = new Date(p.deadline).getTime();
          const daysLeft = Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24));
          return {
            id: p.id,
            author: p.profiles?.username || "未知用户",
            avatar_url: p.profiles?.avatar_url,
            title: p.title,
            timeLeft: daysLeft > 0 ? `${daysLeft}天后` : '已截止',
            votes: p.votes ? p.votes.length : 0,
            accurateRate: '100%' // MVP static
          };
        });
        setPredictions(formatted);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen p-6 sm:p-10 max-w-lg mx-auto w-full pt-10 flex flex-col relative">
      <Link href="/" className="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-indigo-500 transition-colors w-max">
        <ArrowLeft size={16} className="mr-1" /> 返回首页
      </Link>

      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">广场</h1>
          <p className="text-slate-500 text-sm">发现在你圈子里的疯狂赌注与目标</p>
        </div>
        <div className="flex flex-col gap-3 items-end">
          <Link href="/create">
            <button className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl px-4 py-2 text-sm font-bold shadow-md shadow-indigo-500/30 flex items-center gap-1 active:scale-95 transition-transform hover:shadow-lg">
              <Plus size={16} /> 发布契约
            </button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 pb-20">
        {loading ? (
          <div className="text-center text-slate-500 py-10">🌍 正在与灵界同步预言...</div>
        ) : predictions.length === 0 ? (
          <div className="text-center text-slate-500 py-10">咦，居然什么都没有。赶紧发布第一个吧！</div>
        ) : predictions.map((p) => (
          <Link href={`/p/${p.id}`} key={p.id}>
            <div className="glass-panel group hover:cursor-pointer relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="avatar" className="w-8 h-8 rounded-full shadow-sm bg-white" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500 font-bold text-xs uppercase">
                      {p.author.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold">{p.author}</h4>
                    <p className="text-[10px] text-slate-400">先知胜率 {p.accurateRate}</p>
                  </div>
                </div>
                <span className="text-[11px] bg-black/5 dark:bg-white/10 px-2 py-1 rounded-md flex items-center gap-1">
                  <Clock size={12} /> {p.timeLeft}
                </span>
              </div>
              <h2 className="text-lg font-bold leading-snug mb-4 text-slate-800 dark:text-slate-100">{p.title}</h2>
              <div className="flex justify-between items-center text-sm text-slate-500">
                <span className="flex items-center gap-1 font-medium"><Users size={14} /> {p.votes} 人已入局</span>
                <span className="text-indigo-500 font-medium group-hover:translate-x-1 transition-transform">去吃瓜 &rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
