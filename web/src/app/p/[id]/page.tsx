"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Users, ArrowLeft, ShieldCheck, Send } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function DetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [voted, setVoted] = useState<"positive" | "negative" | null>(null);
  const [posPct, setPosPct] = useState(50);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);
  const [voting, setVoting] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData.user;
      setUser(currentUser);

      // Load Prediction Info
      const { data: pData } = await supabase
        .from('predictions')
        .select(`id, title, deadline, reward, status, final_result, author_id, profiles (username, avatar_url)`)
        .eq('id', id)
        .single();
      
      // Load Votes
      const { data: vData } = await supabase
        .from('votes')
        .select('user_id, vote_type')
        .eq('prediction_id', id);

      if (pData) {
         let positive = 0;
         let negative = 0;
         let myVote = null;

         vData?.forEach(v => {
           if (v.vote_type === 'positive') positive++;
           if (v.vote_type === 'negative') negative++;
           if (currentUser && v.user_id === currentUser.id) {
             myVote = v.vote_type;
           }
         });
         
         setVoted(myVote);
         const total = positive + negative;
         setPosPct(total > 0 ? Math.round((positive / total) * 100) : 50);

         const target = new Date(pData.deadline).getTime();
         const daysLeft = Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24));

         setData({
           id: pData.id,
           author_id: pData.author_id,
           author: (pData.profiles as any)?.username || "佚名",
           title: pData.title,
           status: pData.status,
           final_result: pData.final_result,
           timeLeft: daysLeft > 0 ? `${daysLeft}天后` : '已截止',
           votes: total
         });
      }

      // Load Comments
      const { data: cData } = await supabase
        .from('comments')
        .select(`id, content, created_at, profiles (username)`)
        .eq('prediction_id', id)
        .order('created_at', { ascending: false });

      if (cData) {
        setComments(cData.map(c => ({
          id: c.id,
          author: (c.profiles as any)?.username || "游客",
          text: c.content,
          time: new Date(c.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        })));
      }
    }
    loadData();
  }, [id, supabase]);

  const handleVote = async (type: "positive" | "negative") => {
    if (!user) {
      if (confirm("你要先验证先知身份才能参与盖章哦！是否前往登录？")) {
        window.location.href = '/login';
      }
      return;
    }
    if (voting) return;
    setVoting(true);

    if (voted === type) {
      // Cancel vote
      await supabase.from('votes').delete().eq('prediction_id', id).eq('user_id', user.id);
      setVoted(null);
      setData({...data, votes: Math.max(0, data.votes - 1)});
    } else {
      // Upsert vote
      await supabase.from('votes').upsert({ 
        prediction_id: id as string, 
        user_id: user.id, 
        vote_type: type 
      }, { onConflict: 'prediction_id,user_id' });
      
      if (!voted) setData({...data, votes: data.votes + 1});
      setVoted(type);
    }
    setVoting(false);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) {
      if (confirm("发弹幕吃瓜也需要先报上名号哦！是否前往登录？")) {
        window.location.href = '/login';
      }
      return;
    }

    setSubmittingComment(true);
    const { data: insertData, error } = await supabase.from('comments').insert({
      prediction_id: id as string,
      user_id: user.id,
      content: newComment
    }).select('id, content, created_at, profiles(username)').single();

    if (!error && insertData) {
      const c = { 
        id: insertData.id, 
        author: (insertData.profiles as any)?.username || "我", 
        text: insertData.content, 
        time: "刚刚" 
      };
      setComments([c, ...comments]);
      setNewComment("");
    } else {
      alert("发送失败: " + error?.message);
    }
    setSubmittingComment(false);
  };

  const resolveMatch = async (result: "positive" | "negative") => {
    if (!confirm(`确定要结算并判定为【${result === 'positive' ? '挑战成功' : '失败打脸'}】吗？此操作不可逆！`)) return;
    
    // Call securely isolated Postgres RPC
    const { error } = await supabase.rpc('resolve_prediction', { 
      p_id: id, 
      p_result: result 
    });

    if (error) {
      alert("结算失败: " + error.message);
    } else {
      setData({...data, status: 'resolved', final_result: result});
      alert(`结算成功！参与盖章的用户已自动发放欢乐豆奖励！`);
    }
  };

  if (!data) {
    return (
      <main className="min-h-screen p-6 max-w-lg mx-auto w-full pt-20 text-center text-slate-500">
        正在读取契约内容...
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-lg mx-auto w-full pt-10 flex flex-col relative pb-32">
      <Link href="/explore" className="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-indigo-500 transition-colors w-max">
        <ArrowLeft size={16} className="mr-1" /> 返回广场
      </Link>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-panel relative flex flex-col"
      >
        <div className="flex items-center gap-2 mb-4 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold uppercase shrink-0">
              {data.author.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{data.author} 发起的契约</h3>
              <p className="text-xs text-slate-400">距离开奖还有: {data.timeLeft}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20 shrink-0">
            <ShieldCheck size={12}/> AI 裁判防作弊
          </div>
        </div>

        <h1 className="text-2xl font-extrabold mb-8 leading-tight">
          {data.title}
        </h1>

        {data.status === 'resolved' ? (
          <div className={`mb-8 p-6 rounded-2xl border ${data.final_result === 'positive' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-pink-500/10 border-pink-500/30'} flex flex-col items-center justify-center text-center shadow-inner`}>
            <span className="text-4xl mb-3">{data.final_result === 'positive' ? '🎉' : '🤡'}</span>
            <h2 className={`text-xl font-bold mb-1 ${data.final_result === 'positive' ? 'text-blue-500' : 'text-pink-500'}`}>
              最终结果：{data.final_result === 'positive' ? '挑战成功！' : '惨遭打脸！'}
            </h2>
            <p className="text-xs text-slate-500">胜出的先知们已瓜分目标奖励积分</p>
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex justify-between text-xs font-bold mb-2 transition-all">
              <span className="text-blue-500">能做到 ({posPct}%)</span>
              <span className="text-pink-500">悬了 ({100 - posPct}%)</span>
            </div>
            <div className="h-4 w-full bg-black/5 dark:bg-white/10 shadow-inner rounded-full overflow-hidden flex relative">
              <motion.div initial={{width:0}} animate={{width:`${posPct}%`}} className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" transition={{duration:0.6, ease: "easeOut"}}/>
              <motion.div initial={{width:0}} animate={{width:`${100 - posPct}%`}} className="h-full bg-gradient-to-r from-pink-500 to-rose-500" transition={{duration:0.6, ease: "easeOut"}}/>
            </div>
            <p className="text-center text-xs text-slate-400 mt-3 font-medium flex items-center justify-center gap-1">
              <Users size={14}/> {data.votes} 人已入局
            </p>
          </div>
        )}

        {/* Action Buttons (Hidden if resolved) */}
        {data.status === 'active' && (
          <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-3">
            <motion.button 
              whileTap={{scale: 0.98}}

            onClick={() => handleVote("positive")}
            className={`w-full p-4 rounded-2xl font-bold shadow-lg flex justify-between items-center group transition-colors ${
              voted === "positive" 
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-blue-500/30 border border-blue-400" 
                : "bg-white/40 dark:bg-black/20 text-slate-700 dark:text-slate-200 shadow-none border border-slate-200 dark:border-slate-800"
            }`}
          >
            <span>{voted === "positive" ? "✅ 已下注：支持能成！" : "支持能成！"}</span> 
            <span className="text-xl group-hover:scale-125 transition-transform">👍</span>
          </motion.button>
          
          <motion.button 
            whileTap={{scale: 0.98}}
            onClick={() => handleVote("negative")}
            className={`w-full p-4 rounded-2xl font-bold shadow-lg flex justify-between items-center group transition-colors ${
              voted === "negative" 
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/30 border border-pink-400" 
                : "bg-white/40 dark:bg-black/20 text-slate-700 dark:text-slate-200 shadow-none border border-slate-200 dark:border-slate-800"
            }`}
          >
            <span>{voted === "negative" ? "✅ 已下注：坐等打脸！" : "不信，打脸！"}</span> 
            <span className="text-xl group-hover:scale-125 transition-transform">👎</span>
          </motion.button>
          
          <p className="text-[11px] text-center text-slate-400 mt-1">再次点击可取消下注 ✨</p>
        </div>
        )}

        {/* Author Settlement Panel */}
        {data.status === 'active' && user?.id === data.author_id && (
          <div className="mt-8 bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5 align-middle">
              👑 发起人专属：提前开奖结算
            </h3>
            <div className="flex gap-3">
              <button onClick={() => resolveMatch('positive')} className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/30 font-bold py-2 rounded-xl text-xs transition-colors">
                结算：我成功做到了！
              </button>
              <button onClick={() => resolveMatch('negative')} className="flex-1 bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 border border-pink-500/30 font-bold py-2 rounded-xl text-xs transition-colors">
                结算：咳..我被打脸了
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Comments Section */}
      <div className="mt-8">
        <h4 className="font-bold text-sm mb-4 px-2">实名弹幕吃瓜 ({comments.length})</h4>
        
        <form onSubmit={submitComment} className="flex gap-2 mb-6 px-1">
          <input 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="发句弹幕..." 
            className="flex-1 bg-white/60 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm"
          />
          <button type="submit" disabled={!newComment.trim() || submittingComment} className="bg-indigo-500 disabled:opacity-50 text-white px-5 rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center">
            <Send size={16} />
          </button>
        </form>

        <div className="flex flex-col gap-5 px-2">
          {comments.map((c: any) => (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold uppercase shrink-0 text-slate-500">
                {c.author.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{c.author}</span>
                  <span className="text-[10px] text-slate-400">{c.time}</span>
                </div>
                <p className="text-sm text-slate-900 dark:text-slate-100 mt-1 leading-relaxed bg-white/40 dark:bg-black/20 p-3 rounded-tr-2xl rounded-b-2xl border border-slate-200/50 dark:border-slate-800/50 inline-block">
                  {c.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
