import { useEffect, useRef } from 'react';
import { AlertTriangle, ShieldCheck, Clock, LayoutDashboard, X } from 'lucide-react';

const notifications = [
  { id: 1, type: 'critical', icon: AlertTriangle, title: 'Zero-day in Nginx v1.2.4', desc: 'Immediate patching required on 3 nodes.', time: '2m ago', unread: true },
  { id: 2, type: 'warning', icon: Clock, title: 'Kernel update pending', desc: 'Node-42 (US-East) has been flagged.', time: '45m ago', unread: true },
  { id: 3, type: 'success', icon: ShieldCheck, title: 'Auto-patch successful', desc: '12 nodes updated without errors.', time: '2h ago', unread: false },
  { id: 4, type: 'info', icon: LayoutDashboard, title: 'New group: Edge-Fleet', desc: 'Deployment group created by admin.', time: '5h ago', unread: false },
];

const colors = {
  critical: 'bg-rose-500/10 text-rose-400',
  warning:  'bg-amber-500/10 text-amber-400',
  success:  'bg-emerald-500/10 text-emerald-400',
  info:     'bg-blue-500/10 text-blue-400',
};

export default function NotificationPanel({ onClose }) {
  const ref = useRef();
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute top-20 right-44 z-50 w-96 bg-slate-900 border border-slate-700/50 rounded-[1.5rem] shadow-2xl shadow-black/60 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <div>
          <h3 className="font-bold text-white font-['Outfit',_sans-serif]">Notifications</h3>
          <p className="text-[11px] text-slate-500">2 unread alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Mark all read</button>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-800/40 max-h-96 overflow-y-auto">
        {notifications.map(n => (
          <div key={n.id} className={`flex gap-4 px-5 py-4 hover:bg-slate-800/40 transition-all cursor-pointer ${n.unread ? 'bg-indigo-600/5' : ''}`}>
            <div className={`p-2.5 rounded-xl h-fit mt-0.5 shrink-0 ${colors[n.type]}`}>
              <n.icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-bold leading-tight ${n.unread ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                {n.unread && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1 shrink-0"></span>}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.desc}</p>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-slate-800/50 text-center">
        <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">View all notifications →</button>
      </div>
    </div>
  );
}
