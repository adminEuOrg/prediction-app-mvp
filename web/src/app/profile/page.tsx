"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, Award, Target, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [created, setCreated] = useState<any[]>([]);
  const [voted, setVoted] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"created" | "voted">("created");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch profile
      const { data: pData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (pData) setProfile(pData);

      // Fetch Predictions created by user
      const { data: cData } = await supabase
        .from('predictions')
        .select('id, title, deadline, status, final_result')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });
        
      if (cData) setCreated(cData);

      // Fetch Predictions voted by user
      // Supabase PostgREST allows inner joining via !inner
      const { data: vData } = await supabase
        .from('predictions')
        .select(`
          id, title, deadline, status, final_result,
          votes!inner(vote_type)
        `)
        .eq('votes.user_id', user.id)
        .order('created_at', { ascending: false });

      if (vData) setVoted(vData);

      setLoading(false);
    }
    
    fetchProfileData();
  }, [router]);

  if (loading) {
    return <main className="min-h-screen pt-20 text-center text-slate-500">正在进入先知领域...</main>;
  }

  // Format helper
  const getDaysLeft = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const diff = Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff}天后` : '已截止';
  };

  return (
    <main className="min-h-screen p-6 sm:p-10 max-w-lg mx-auto w-full pt-10 flex flex-col relative pb-32">
      <Link href="/explore" className="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-indigo-500 transition-colors w-max">
        <ArrowLeft size={16} className="mr-1" /> 返回广场
      </Link>

      {/* Profile Header */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-panel text-center mb-8 flex flex-col items-center !p-8"
      >
        <div className="w-20 h-20 rounded-full bg-indigo-500/10 border-4 border-white dark:border-slate-800 shadow-xl mb-4 overflow-hidden flex items-center justify-center">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-indigo-500 uppercase">{profile?.username?.charAt(0)}</span>
          )}
        </div>
        <h1 className="text-2xl font-extrabold mb-1">{profile?.username}</h1>
        <p className="text-xs text-slate-400 mb-6 flex items-center gap-1 justify-center">
          首席大先知 · 验证防伪
        </p>

        <div className="flex w-full justify-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-sm text-slate-500 font-semibold mb-1 flex items-center gap-1"><Award size={14} className="text-amber-500"/> 积分</span>
            <span className="text-2xl font-bold font-mono">{profile?.prophet_points || 0}</span>
          </div>
          <div className="w-[1px] bg-slate-200 dark:bg-slate-800"></div>
          <div className="flex flex-col items-center">
             <span className="text-sm text-slate-500 font-semibold mb-1 flex items-center gap-1"><Target size={14} className="text-blue-500"/> 胜率</span>
             <span className="text-2xl font-bold font-mono">{profile?.win_rate || "0.00"}%</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 relative">
        <button 
          onClick={() => setActiveTab("created")}
          className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeTab === 'created' ? 'text-indigo-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
          我发起的 ({created.length})
        </button>
        <button 
          onClick={() => setActiveTab("voted")}
          className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeTab === 'voted' ? 'text-indigo-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
          我盖章的 ({voted.length})
        </button>
        {/* Animated indicator */}
        <motion.div 
          className="absolute bottom-0 h-1 bg-indigo-500 rounded-t-full w-1/2"
          initial={false}
          animate={{ x: activeTab === 'created' ? '0%' : '100%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {(activeTab === 'created' ? created : voted).length === 0 ? (
          <div className="text-center text-slate-400 py-10 text-sm">
            这里空空如也，快去大展身手吧！
          </div>
        ) : (
          (activeTab === 'created' ? created : voted).map(p => (
            <Link href={`/p/${p.id}`} key={p.id}>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="glass-panel group hover:cursor-pointer !px-5 !py-4 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 flex-1 pr-4 line-clamp-1">{p.title}</h4>
                  <span className="text-xs font-mono bg-black/5 dark:bg-white/10 px-2 py-1 rounded-md whitespace-nowrap">
                    {p.status === 'active' ? getDaysLeft(p.deadline) : '已结算'}
                  </span>
                </div>
                
                {p.status === 'resolved' && (
                  <div className={`mt-3 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 w-max ${p.final_result === 'positive' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-pink-500/10 text-pink-500 border border-pink-500/20'}`}>
                    {p.final_result === 'positive' ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} 
                    {p.final_result === 'positive' ? "挑战成功" : "惨遭打脸"}
                  </div>
                )}
                
                {/* if viewing 'voted' tab, show which side they picked */}
                {activeTab === 'voted' && p.votes && (
                  <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-3">
                    你的盖章：<span className="font-bold">{p.votes[0]?.vote_type === 'positive' ? '👍 支持能成' : '👎 不信打脸'}</span>
                  </div>
                )}
              </motion.div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
