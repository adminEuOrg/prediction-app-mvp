"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Send, Sparkles, Calendar, Gift } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function CreatePrediction() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [reward, setReward] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        alert("发布契约需要先验证先知的身份！");
        router.push("/login");
      }
    }
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !reward || !deadline) return;

    setIsSubmitting(true);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("请先登录再发布预测！");
      router.push('/login');
      return;
    }

    const { data, error } = await supabase.from('predictions').insert({
      author_id: user.id,
      title: title,
      reward: reward,
      deadline: new Date(deadline).toISOString(),
      status: 'active'
    }).select().single();

    if (error) {
      console.error(error);
      alert("发布失败: " + error.message);
      setIsSubmitting(false);
      return;
    }

    // Route to the new prediction detail page
    router.push(`/p/${data.id}`);
  };

  return (
    <main className="min-h-screen p-6 max-w-lg mx-auto w-full pt-10 flex flex-col relative">
      <Link href="/" className="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-indigo-500 transition-colors w-max">
        <ArrowLeft size={16} className="mr-1" /> 返回首页
      </Link>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-panel relative flex-1"
      >
        <div className="flex items-center gap-2 mb-6 text-indigo-500">
          <Sparkles className="w-5 h-5" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">立下先知契约</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
              你的目标或预测是什么？
            </label>
            <textarea 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：这月底我一定能瘦 5 斤，立帖为证！"
              className="w-full bg-white/40 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none h-24"
            />
          </div>

          {/* Reward Field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
              <Gift size={16} className="text-pink-500" /> 对赌承诺 (激励)
            </label>
            <input 
              required
              type="text"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="例如：赢家一起瓜分 1000 欢乐豆"
              className="w-full bg-white/40 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* Deadline Field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
              <Calendar size={16} className="text-blue-500" /> 截止与开奖时间
            </label>
            <input 
              required
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-white/40 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-2">
            <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed font-medium">
              💡 提交后，我们将自动采用 **AI 智能裁判** 作为见证机制。所有朋友均可在截止前进行实名压注。
            </p>
          </div>

          {/* Submit Button */}
          <motion.button 
            whileTap={{scale: 0.98}}
            disabled={isSubmitting}
            type="submit"
            className="w-full p-4 mt-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg shadow-indigo-500/30 flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"/> 生成契约中...</span>
            ) : (
              <><Send size={18} /> 发起契约并邀请好友</>
            )}
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
}
