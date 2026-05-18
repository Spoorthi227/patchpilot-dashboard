import { useState } from 'react';
import { ShieldAlert, ShieldCheck, Clock, Search, Filter, CheckCircle, XCircle, ChevronRight, Info } from 'lucide-react';

const patchIntelligenceData = [
  { cve: 'CVE-2024-30044', kb: 'KB5037771', severity: 'Critical', os: 'Windows 11 v23H2', desc: 'Microsoft Office SharePoint Remote Code Execution Vulnerability', date: '2024-05-14', status: 'Pending' },
  { cve: 'CVE-2024-30051', kb: 'KB5037768', severity: 'High', os: 'Windows Server 2022', desc: 'Windows DWM Core Library Elevation of Privilege Vulnerability', date: '2024-05-14', status: 'Approved' },
  { cve: 'CVE-2024-30046', kb: 'KB5037765', severity: 'Critical', os: 'Windows 11 v22H2', desc: 'Visual Studio Code Remote Code Execution Vulnerability', date: '2024-05-10', status: 'Pending' },
  { cve: 'CVE-2024-21408', kb: 'KB5036893', severity: 'Medium', os: 'Windows Server 2019', desc: 'Windows Hyper-V Denial of Service Vulnerability', date: '2024-05-08', status: 'Approved' },
  { cve: 'CVE-2024-21307', kb: 'KB5036892', severity: 'High', os: 'Windows 10 v22H2', desc: 'Windows Kernel Elevation of Privilege Vulnerability', date: '2024-05-01', status: 'Rejected' },
  { cve: 'CVE-2024-30050', kb: 'KB5037771', severity: 'Critical', os: 'Windows 11 v23H2', desc: 'Windows Mark of the Web Security Feature Bypass Vulnerability', date: '2024-05-14', status: 'Pending' },
];

export default function PatchIntelligence({ role, onShowToast }) {
  const [filter, setFilter] = useState('');
  const [data, setData] = useState(patchIntelligenceData);

  const filteredData = data.filter(p => 
    p.cve.toLowerCase().includes(filter.toLowerCase()) || 
    p.kb.toLowerCase().includes(filter.toLowerCase()) ||
    p.desc.toLowerCase().includes(filter.toLowerCase())
  );

  const handleAction = (cve, newStatus) => {
    setData(prev => prev.map(p => p.cve === cve ? { ...p, status: newStatus } : p));
    onShowToast(`Patch ${cve} ${newStatus === 'Approved' ? 'approved for deployment' : 'rejected'}`);
  };

  const stats = [
    { label: 'Total Identified', value: data.length, icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Critical Risks', value: data.filter(p => p.severity === 'Critical').length, icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'High Priority', value: data.filter(p => p.severity === 'High').length, icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Pending Review', value: data.filter(p => p.status === 'Pending').length, icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="animate-slide-up space-y-10">
      {/* Header section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-['Outfit',_sans-serif] font-bold text-white mb-3 text-glow">Patch Intelligence</h1>
          <p className="text-slate-400 font-medium text-lg">Detailed tracking and analysis of available updates</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search CVE, KB or keyword..." 
              className="bg-slate-950/50 border border-slate-800/50 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-indigo-600 transition-all w-64 placeholder:text-slate-600" 
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-[2rem] flex items-center gap-4 group">
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-white leading-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Intelligence Table */}
      <div className="glass-panel rounded-[2.5rem] overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-800/50 bg-slate-900/20 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <Filter size={16} className="text-indigo-400" />
            Security Scanning Results
          </h3>
          <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{filteredData.length} entries found</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800/50">
                <th className="py-5 pl-8">CVE ID</th>
                <th className="py-5">Severity</th>
                <th className="py-5">Description</th>
                <th className="py-5">Affected OS</th>
                <th className="py-5">KB Number</th>
                <th className="py-5 text-right pr-8">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredData.map((patch, i) => (
                <tr key={i} className="group hover:bg-white/[0.02] transition-colors border-b border-slate-800/30">
                  <td className="py-6 pl-8 font-mono font-bold text-indigo-400">
                    <div className="flex items-center gap-2">
                      {patch.cve}
                      <ChevronRight size={12} className="text-slate-700 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      patch.severity === 'Critical' ? 'bg-rose-500/10 text-rose-500' : 
                      patch.severity === 'High' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {patch.severity}
                    </span>
                  </td>
                  <td className="py-6 pr-6 max-w-xs">
                    <p className="text-slate-200 font-medium leading-relaxed truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                      {patch.desc}
                    </p>
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                      <p className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">{patch.os}</p>
                    </div>
                  </td>
                  <td className="py-6 text-slate-300 font-mono text-xs">{patch.kb}</td>
                  <td className="py-6 text-right pr-8">
                    {patch.status === 'Pending' ? (
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleAction(patch.cve, 'Approved')}
                          className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-all border border-emerald-500/20"
                          title="Approve"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          onClick={() => handleAction(patch.cve, 'Rejected')}
                          className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all border border-rose-500/20"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${
                        patch.status === 'Approved' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {patch.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">
                    No matching threat intelligence found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
