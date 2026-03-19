"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Users, ArrowLeft, ShieldCheck, Send } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [voted, setVoted] = useState<"positive" | "negative" | null>(null);
  const [posPct, setPosPct] = useState(65);
  
  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    // 1. Load Prediction Data
    const storedContent = localStorage.getItem("mock_predictions");
    if (storedContent) {
      const arr = JSON.parse(storedContent);
      const found = arr.find((p: any) => p.id === id);
      if (found) {
        setData(found);
        setPosPct(found.posPct || 50);
      } else {
        fallbackData();
      }
    } else {
      fallbackData();
    }

    // 2. Load My Vote
    const cachedVotes = localStorage.getItem("mock_my_votes");
    if (cachedVotes) {
      const votesObj = JSON.parse(cachedVotes);
      if (votesObj[id as string]) {
        setVoted(votesObj[id as string]);
      }
    }

    // 3. Load Comments
    const cachedComments = localStorage.getItem("mock_comments");
    if (cachedComments) {
      const commentsObj = JSON.parse(cachedComments);
      if (commentsObj[id as string]) {
        setComments(commentsObj[id as string]);
      } else {
        fallbackComments();
      }
    } else {
      fallbackComments();
    }

  }, [id]);

  const fallbackData = () => {
    setData({
      id: id,
      author: "Alex",
      title: "挑战这个月减重5斤，赢家共同瓜分1000欢乐豆，立帖为证！",
      timeLeft: "3天后",
      votes: 128
    });
    setPosPct(65);
  };

  const fallbackComments = () => {
    setComments([
      { id: "101", author: "王刚", text: "有点悬啊兄弟，别勉强", time: "2小时前" },
      { id: "102", author: "李雪", text: "稳的稳的，等分钱了哈哈", time: "5小时前" }
    ]);
  };

  const handleVote = (type: "positive" | "negative") => {
    let nextPct = posPct;
    let voteDiff = 0;
    let nextVote = voted;

    if (voted === type) {
      // Cancel vote
      nextVote = null;
      voteDiff = -1;
      nextPct = type === "positive" ? Math.max(0, posPct - 2) : Math.min(100, posPct + 2);
    } else if (voted && voted !== type) {
      // Switch vote
      nextVote = type;
      voteDiff = 0; 
      nextPct = type === "positive" ? Math.min(100, posPct + 4) : Math.max(0, posPct - 4);
    } else {
      // New vote
      nextVote = type;
      voteDiff = 1;
      nextPct = type === "positive" ? Math.min(100, posPct + 2) : Math.max(0, posPct - 2);
    }

    setVoted(nextVote);
    setPosPct(nextPct);

    // Persist My Vote
    const cachedVotes = localStorage.getItem("mock_my_votes") || "{}";
    const votesObj = JSON.parse(cachedVotes);
    if (nextVote) {
      votesObj[id as string] = nextVote;
    } else {
      delete votesObj[id as string];
    }
    localStorage.setItem("mock_my_votes", JSON.stringify(votesObj));

    // Persist Global Data
    const newVotes = Math.max(0, (data.votes || 0) + voteDiff);
    setData({...data, votes: newVotes});

    const storedContent = localStorage.getItem("mock_predictions");
    if (storedContent) {
      const arr = JSON.parse(storedContent);
      const index = arr.findIndex((p: any) => p.id === id);
      if (index !== -1) {
        arr[index].votes = newVotes;
        arr[index].posPct = nextPct;
        localStorage.setItem("mock_predictions", JSON.stringify(arr));
      }
    }
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const c = { id: Date.now().toString(), author: "我 (Me)", text: newComment, time: "刚刚" };
    const updated = [c, ...comments];
    setComments(updated);
    setNewComment("");

    const commentsStr = localStorage.getItem("mock_comments") || "{}";
    const allComments = JSON.parse(commentsStr);
    allComments[id as string] = updated;
    localStorage.setItem("mock_comments", JSON.stringify(allComments));
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

        {/* 投票进度条 Demo */}
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

        {/* Action Buttons */}
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
          <button type="submit" disabled={!newComment.trim()} className="bg-indigo-500 disabled:opacity-50 text-white px-5 rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center">
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
