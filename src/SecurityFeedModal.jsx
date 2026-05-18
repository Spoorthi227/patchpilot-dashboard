import { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, Clock, LayoutDashboard, ShieldAlert, Server, Zap, Filter } from 'lucide-react';

const allFeeds = [
  { id: 1, type: 'critical', icon: AlertTriangle,    title: 'Zero-day in Nginx v1.2.4',                    desc: 'Active exploitation detected in the wild. Patch CVE-2024-3094 immediately on all edge nodes.',          time: '2m ago',  node: 'Edge-Fleet' },
  { id: 2, type: 'warning',  icon: Clock,             title: 'Kernel update required on Node-42 (US-East)', desc: 'Running kernel 5.15.0-94 has known privilege escalation vector. Schedule maintenance window.',          time: '45m ago', node: 'SRV-US-42' },
  { id: 3, type: 'success',  icon: ShieldCheck,       title: 'Auto-patch successful on 12 nodes',           desc: 'KB5034123 deployed without errors. All 12 nodes rebooted and confirmed healthy.',                       time: '2h ago',  node: 'Fleet-Zone-A' },
  { id: 4, type: 'info',     icon: LayoutDashboard,   title: 'New deployment group: Edge-Fleet',            desc: 'Admin Alex Rivera created deployment group Edge-Fleet-West with 340 nodes.',                          time: '5h ago',  node: 'Global' },
  { id: 5, type: 'critical', icon: ShieldAlert,       title: 'CVE-2024-21762 — FortiOS SSL-VPN RCE',       desc: 'Critical remote code execution in FortiOS. CVSS 9.8. Patching required for all gateway nodes.',         time: '6h ago',  node: 'GW-Fleet' },
  { id: 6, type: 'warning',  icon: AlertTriangle,     title: 'Certificate expiry in 7 days — SRV-WEB-02',  desc: 'TLS cert expires 2024-05-23. Auto-renewal failed. Manual intervention required.',                     time: '8h ago',  node: 'SRV-WEB-02' },
  { id: 7, type: 'success',  icon: ShieldCheck,       title: 'Compliance scan passed — SOC2 Q2',           desc: 'All 4,520 managed nodes passed the SOC2 Type II quarterly audit scan.',                               time: '12h ago', node: 'All Nodes' },
  { id: 8, type: 'info',     icon: Server,            title: 'New node onboarded: SRV-PROD-09',            desc: 'New production server SRV-PROD-09 (10.0.4.19) registered and agent deployed.',                        time: '1d ago',  node: 'PROD-Zone' },
  { id: 9, type: 'critical', icon: Zap,               title: 'Ransomware signature detected — WS-DEV-12', desc: 'Behavioural anomaly matching Lockbit 3.0 pattern detected. Node isolated automatically.',              time: '1d ago',  node: 'WS-DEV-12' },
  { id: 10,type: 'warning',  icon: Clock,             title: 'Patch KB5034765 missed 3 nodes',             desc: 'Critical patch failed to deploy on WS-DEV-12, SRV-DB-04, WS-PROD-03 due to timeout.',                 time: '2d ago',  node: 'Multiple' },
];

const typeConfig = {
  critical: { label: 'Critical', bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/20',    dot: 'bg-rose-400'    },
  warning:  { label: 'Warning',  bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20',   dot: 'bg-amber-400'   },
  success:  { label: 'Success',  bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  info:     { label: 'Info',     bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20',    dot: 'bg-blue-400'    },
};

const filters = ['All', 'Critical', 'Warning', 'Success', 'Info'];

export default function SecurityFeedModal({ onClose }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);

  const filtered = activeFilter === 'All'
    ? allFeeds
    : allFeeds.filter(f => f.type === activeFilter.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-[2rem] w-full max-w-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col" style={{ height: '90vh', maxHeight: '720px' }}>

        {/* Header */}
        <div className="relative bg-gradient-to-br from-rose-600/10 to-slate-900 border-b border-slate-800/50 px-8 py-6 shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(244,63,94,0.08),_transparent_60%)]"></div>
          <button onClick={onClose} className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors z-10"><X size={22} /></button>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <ShieldAlert size={20} className="text-rose-400" />
              </div>
              <h2 className="text-2xl font-bold text-white font-['Outfit',_sans-serif]">Security Feed</h2>
              <span className="ml-auto px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                {allFeeds.filter(f => f.type === 'critical').length} Critical Active
              </span>
            </div>
            <p className="text-sm text-slate-400 ml-12">Real-time threat intelligence and system event log</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-800/50 flex items-center gap-2 shrink-0">
          <Filter size={14} className="text-slate-500 shrink-0" />
          <div className="flex gap-2 flex-wrap">
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                  activeFilter === f
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                }`}>{f}
                {f !== 'All' && (
                  <span className="ml-1.5 opacity-60">
                    {allFeeds.filter(x => x.type === f.toLowerCase()).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="ml-auto text-[11px] text-slate-600 font-bold shrink-0">{filtered.length} events</p>
        </div>

        {/* Feed List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-800/30">
          {filtered.map(item => {
            const cfg = typeConfig[item.type];
            const isOpen = expanded === item.id;
            return (
              <div key={item.id}
                onClick={() => setExpanded(isOpen ? null : item.id)}
                className="px-6 py-4 hover:bg-slate-800/30 transition-all cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                    <item.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <p className={`text-sm font-bold leading-tight group-hover:text-white transition-colors ${isOpen ? 'text-white' : 'text-slate-200'}`}>
                        {item.title}
                      </p>
                      <span className={`shrink-0 ml-auto px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`}></span>
                      <p className="text-[11px] text-slate-500 font-mono">{item.node}</p>
                      <p className="text-[11px] text-slate-600 font-bold uppercase tracking-wider ml-auto">{item.time}</p>
                    </div>
                    {isOpen && (
                      <div className={`mt-3 p-3 rounded-2xl ${cfg.bg} border ${cfg.border}`}>
                        <p className={`text-xs leading-relaxed font-medium ${cfg.text}`}>{item.desc}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-600 font-bold">No events match this filter.</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-800/50 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-600">Click any event to expand details</p>
          <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-all border border-slate-700/50">Close</button>
        </div>
      </div>
    </div>
  );
}
