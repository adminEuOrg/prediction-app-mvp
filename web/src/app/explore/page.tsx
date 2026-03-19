"use client";

import Link from "next/link";
import { Users, Clock, Trash2, ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";

const INITIAL_MOCKS = [
  { id: "1", author: "Alex", title: "挑战这个月减重5斤，赢家共同瓜分1000欢乐豆", votes: 128, timeLeft: "3天后结算", accurateRate: "89%" },
  { id: "2", author: "Sarah的毒奶", title: "湖人今晚必胜！输了我明天群里发大红包", votes: 45, timeLeft: "今晚 23:00", accurateRate: "72%" },
  { id: "3", author: "老李", title: "3个月内考出雅思7.0，没考出我请客吃饭", votes: 21, timeLeft: "3个月后", accurateRate: "45%" },
];

export default function Explore() {
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("mock_predictions");
    if (stored) {
      setPredictions([...JSON.parse(stored), ...INITIAL_MOCKS]);
    } else {
      setPredictions(INITIAL_MOCKS);
    }
  }, []);

  const clearStorage = () => {
    localStorage.removeItem("mock_predictions");
    setPredictions(INITIAL_MOCKS);
  };

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
          <button onClick={clearStorage} className="text-[10px] text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1" title="清空我创建的Mock数据">
            <Trash2 size={12} /> 清理假数据
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {predictions.map((p) => (
          <Link href={`/p/${p.id}`} key={p.id}>
            <div className="glass-panel group hover:cursor-pointer relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500 font-bold text-xs uppercase">
                    {p.author.charAt(0)}
                  </div>
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
