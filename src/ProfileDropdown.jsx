import { useEffect, useRef } from 'react';
import { User, Settings, Shield, LogOut, ChevronRight } from 'lucide-react';

export default function ProfileDropdown({ userRole, onLogout, onSettings, onClose }) {
  const ref = useRef();
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const isAdmin = userRole === 'admin';

  const menuItems = [
    { icon: User, label: 'View Profile', action: onClose },
    { icon: Settings, label: 'Account Settings', action: () => { onSettings(); onClose(); } },
    { icon: Shield, label: isAdmin ? 'Admin Console' : 'Security Overview', action: onClose },
  ];

  return (
    <div ref={ref} className="absolute top-20 right-6 z-50 w-72 bg-slate-900 border border-slate-700/50 rounded-[1.5rem] shadow-2xl shadow-black/60 overflow-hidden">
      {/* Profile Card */}
      <div className="px-5 py-5 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-b border-slate-800/50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 flex items-center justify-center font-bold text-white text-lg shadow-xl border border-white/10">
            {isAdmin ? 'AR' : 'NU'}
          </div>
          <div>
            <p className="font-bold text-white font-['Outfit',_sans-serif]">Alex Rivera</p>
            <p className="text-xs text-indigo-400 font-semibold">{isAdmin ? 'Security Admin' : 'Node User'}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">alex.rivera@patchpilot.io</p>
          </div>
        </div>
        <div className={`mt-4 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold ${isAdmin ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' : 'bg-slate-800 text-slate-400 border border-slate-700/50'}`}>
          <Shield size={13} />
          {isAdmin ? 'Enterprise Admin — Full Access' : 'Node User — Read Only'}
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item, i) => (
          <button key={i} onClick={item.action}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-800/50 transition-all group">
            <div className="flex items-center gap-3">
              <item.icon size={16} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
            </div>
            <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 py-3 border-t border-slate-800/50">
        <button onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all text-sm font-bold border border-transparent hover:border-rose-500/20">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}
