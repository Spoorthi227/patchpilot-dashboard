import { useState } from 'react';
import { ShieldCheck, User, Shield, ArrowRight } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('user@acme.com');
  const [password, setPassword] = useState('password');

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-['Inter',_sans-serif]">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[440px] bg-slate-900/40 backdrop-blur-2xl border border-slate-800/50 rounded-[2.5rem] p-10 shadow-2xl relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-indigo-600/20 group hover:scale-110 transition-transform cursor-pointer">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h2 className="font-['Outfit',_sans-serif] font-bold text-2xl text-white tracking-tight uppercase mb-1">PatchPilot</h2>
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em]">Update Intelligence</p>
        </div>

        {/* Welcome Text */}
        <div className="mb-8">
          <h1 className="text-3xl font-['Outfit',_sans-serif] font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 text-sm font-medium">Sign in to manage your Windows updates</p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(role); }}>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800/50 rounded-2xl py-3.5 px-5 text-white text-sm focus:ring-2 focus:ring-indigo-600 focus:bg-slate-950 outline-none transition-all placeholder:text-slate-700"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800/50 rounded-2xl py-3.5 px-5 text-white text-sm focus:ring-2 focus:ring-indigo-600 focus:bg-slate-950 outline-none transition-all placeholder:text-slate-700"
              placeholder="••••••••"
            />
          </div>

          {/* Role Selector */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Sign in as</label>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => onLogin('user')}
                className="flex items-center gap-4 p-4 rounded-2xl border border-slate-800/50 bg-slate-950/50 hover:bg-slate-900 hover:border-indigo-500/50 transition-all text-left group shadow-lg"
              >
                <div className="p-2.5 rounded-xl bg-slate-900 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <User size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">Node Operator</p>
                    <span className="text-[8px] font-black bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase group-hover:bg-indigo-500/20 group-hover:text-indigo-400">Instant Access</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Read-only dashboard & asset monitoring</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onLogin('admin')}
                className="flex items-center gap-4 p-4 rounded-2xl border border-slate-800/50 bg-slate-950/50 hover:bg-slate-900 hover:border-indigo-500/50 transition-all text-left group shadow-lg"
              >
                <div className="p-2.5 rounded-xl bg-slate-900 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Shield size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">Security Admin</p>
                    <span className="text-[8px] font-black bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase group-hover:bg-indigo-500/20 group-hover:text-indigo-400">Instant Access</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Full system access & patch deployments</p>
                </div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-[1.01] active:scale-[0.99] mt-4 group"
          >
            Sign in to dashboard
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-500 font-medium">
          Try both roles — <span className="text-indigo-400 font-bold">Admin</span> unlocks Approval Center
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
