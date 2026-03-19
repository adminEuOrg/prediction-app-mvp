import { login, signup } from './actions'

export default async function LoginPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const searchParams = await props.searchParams;
  const message = searchParams.message;

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center pt-10 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 -z-10" />
      <div className="glass-panel w-full max-w-sm p-8 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">登 录</h1>
          <p className="text-xs text-slate-500">登录或注册一个预测家账号</p>
        </div>
        
        {message && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl text-center">
            {message}
          </div>
        )}

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500" htmlFor="email">邮箱</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500" htmlFor="password">密码</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          
          <div className="pt-4 flex flex-col gap-3">
             <button formAction={login} className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl py-3 font-bold shadow-md shadow-indigo-500/30 hover:-translate-y-0.5 transition-transform active:scale-95">
               登 录
             </button>
             <button formAction={signup} className="w-full bg-white/40 dark:bg-black/20 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl py-3 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors active:scale-95">
               注 册
             </button>
          </div>
        </form>
      </div>
    </main>
  )
}
