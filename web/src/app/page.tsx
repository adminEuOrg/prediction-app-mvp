"use client";

import { motion } from "framer-motion";
import { ArrowRight, Target, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-10 max-w-lg mx-auto w-full">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full text-center mb-10 mt-10"
      >
        <div className="inline-block p-3 rounded-full bg-indigo-500/10 text-indigo-500 mb-4 animate-pulse">
          <Zap size={24} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          立下你的<br />
          <span className="custom-gradient-text">先知契约</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-xs mx-auto">
          在朋友圈发起预测与目标对赌，让所有好友见证你的兑现时刻。
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full flex flex-col gap-4 z-10"
      >
        <Link href="/create" className="w-full">
          <button className="w-full glass relative overflow-hidden group rounded-2xl p-4 flex items-center justify-center gap-2 text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all font-semibold text-lg hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]">
            发起新预测
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
        <Link href="/explore" className="w-full">
          <button className="w-full glass-panel !p-4 !rounded-2xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-black/20 transition-all active:scale-[0.98]">
            查看广场
          </button>
        </Link>
      </motion.div>

      {/* Features Showcase */}
      <div className="w-full grid grid-cols-2 gap-4 mt-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel !p-5 flex flex-col items-center text-center gap-2"
        >
          <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500">
            <Target size={24} />
          </div>
          <h3 className="font-bold text-sm">硬核对赌</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">AI图像裁判，防止熟人赖账</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel !p-5 flex flex-col items-center text-center gap-2"
        >
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <Users size={24} />
          </div>
          <h3 className="font-bold text-sm">全局先知积分</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">赢取声誉，成为朋友圈预言家</p>
        </motion.div>
      </div>
    </main>
  );
}
