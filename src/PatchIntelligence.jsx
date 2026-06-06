import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, ShieldCheck, Clock, Search, Filter, CheckCircle, XCircle, Info, ChevronDown, AlertTriangle, SquareDivide } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const TODAY = new Date().toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function getSeverity(risk) {
  const r = (risk || '').toLowerCase();
  if (r === 'high') return 'High';
  if (r === 'medium') return 'Medium';
  return 'Low';
}

function getDescription(category, service) {
  const cat = (category || '').toLowerCase();
  const svc = (service || '').toLowerCase();

  if (cat.includes('kernel')) return 'Kernel security update';
  if (svc.includes('nginx')) return 'Web server patch';
  return 'System package security update';
}

function augmentEntry(entry) {
  return {
    package: entry.package || entry.packageName || 'N/A',

    category:
      entry.category && String(entry.category).toLowerCase() === 'unknown'
        ? 'System'
        : entry.category || 'System',

    risk: entry.risk || 'SAFE',

    cve: entry.cve || entry.cveId || 'N/A',

    epss: entry.epss || entry.epssScore || '0',

    severity:
      entry.severity ||
      getSeverity(entry.risk),

    description:
      entry.description ||
      'Security package update',

    affectedDependencies:
      entry.affectedDependencies && String(entry.affectedDependencies).trim() !== ''
        ? entry.affectedDependencies
        : 'None',

    affectedOs:
      entry.affectedOs ||
      'Ubuntu 24.04 LTS',

    date:
      entry.date ||
      TODAY,

    status:
      entry.status ||
      'Pending',

    action:
      entry.action ||
      'Approval Needed',
  };
}
// ─── Sub-components ──────────────────────────────────────────────────────────

function RiskBadge({ risk }) {
  const map = {
    High:   'text-rose-400 bg-rose-500/10 border-rose-500/20',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Low:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };
  const cls = map[risk] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${cls}`}>
      {risk}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    Pending:  'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Rejected: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };
  const cls = map[status] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${cls}`}>
      {status}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const INITIAL_COUNT = 10;
const LOAD_MORE_COUNT = 15;

const ALL_COLUMNS = [
  { label: 'Package Name', key: 'package', minW: 'min-w-[250px]' },
  { label: 'Category', key: 'category', minW: 'min-w-[120px]' },
  { label: 'Risk', key: 'risk', minW: 'min-w-[100px]' },
  { label: 'CVE ID', key: 'cve', minW: 'min-w-[140px]' },
  { label: 'EPSS Score', key: 'epss', minW: 'min-w-[120px]' },
  { label: 'Severity', key: 'severity', minW: 'min-w-[120px]' },
  { label: 'Description', key: 'description', minW: 'min-w-[300px]' },
  { label: 'Affected Dependencies', key: 'affectedDependencies', minW: 'min-w-[220px]' },
  { label: 'Affected OS', key: 'affectedOs', minW: 'min-w-[140px]' },
  { label: 'Date', key: 'date', minW: 'min-w-[120px]' },
  { label: 'Status', key: 'status', minW: 'min-w-[120px]' },
  { label: 'Action', key: 'action', minW: 'min-w-[180px]' },
];

export default function PatchIntelligence({ role, onShowToast }) {
  const [allData, setAllData]           = useState([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [filter, setFilter]             = useState('');
  const [fetchError, setFetchError]     = useState(false);
  const [lastUpdated, setLastUpdated]   = useState(null);

  // ── Fetch & poll every 5 seconds ────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/patches');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const parsed = Array.isArray(json) ? json : [];
      setAllData(parsed.map(augmentEntry));
      setFetchError(false);
      setLastUpdated(new Date().toLocaleTimeString());
      console.log('[PatchIntelligence] Fetched', parsed.length, 'entries');
    } catch (err) {
      console.error('[PatchIntelligence] Fetch failed:', err);
      setFetchError(true);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, [fetchData]);

  // ── Filter ───────────────────────────────────────────────────────────────
  const filteredData = allData.filter(p => {
    const q = filter.toLowerCase();
    if (!q) return true;
    return ALL_COLUMNS.some(col => {
      const val = p[col.key];
      return val && String(val).toLowerCase().includes(q);
    });
  });

  const visibleData   = filteredData.slice(0, visibleCount);
  const hasMore       = visibleCount < filteredData.length;
  const remaining     = filteredData.length - visibleCount;

  // ── Stats cards ──────────────────────────────────────────────────────────
  const stats = [
    {
      label: 'Total Packages',
      value: allData.length,
      icon: <Info size={22} />,
      bg: 'bg-indigo-500',
    },
    {
      label: 'High Severity',
      value: allData.filter(i => i.severity === 'High').length,
      icon: <ShieldAlert size={22} />,
      bg: 'bg-rose-500',
    },
    {
      label: 'Pending',
      value: allData.filter(i => i.status === 'Pending').length,
      icon: <Clock size={22} />,
      bg: 'bg-amber-500',
    },
    {
      label: 'Approved',
      value: allData.filter(i => i.status === 'Approved').length,
      icon: <ShieldCheck size={22} />,
      bg: 'bg-emerald-500',
    },
  ];

  // ── Action handlers ──────────────────────────────────────────────────────
  const handleAnalyze = (patch) => {
    if (onShowToast) onShowToast(`Analyzing: ${patch.package}`);
    console.log('Analyze', patch.package);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="animate-slide-up space-y-8">

      {/* ── Header ── */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-['Outfit',_sans-serif] font-bold text-white mb-2 text-glow">
            Patch Intelligence
          </h1>
          <p className="text-slate-400 font-medium text-lg">
            Detailed tracking and analysis of available updates
          </p>
          {lastUpdated && (
            <p className="text-slate-600 text-xs mt-1">
              Last synced: {lastUpdated} · Auto-refreshes every 5s
            </p>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            id="patch-search"
            type="text"
            value={filter}
            onChange={e => {
              setFilter(e.target.value);
              setVisibleCount(INITIAL_COUNT); // reset pagination on new search
            }}
            placeholder="Search packages, CVE, status…"
            className="bg-slate-950/50 border border-slate-800/50 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-indigo-600 transition-all w-72 placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-[2rem] flex items-center gap-4 group">
            <div className={`p-3 rounded-2xl ${stat.bg} text-white group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-white leading-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Table Card ── */}
      <div className="glass-panel rounded-[2.5rem] overflow-hidden">

        {/* Card Header */}
        <div className="px-8 py-5 border-b border-slate-800/50 bg-slate-900/20 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <Filter size={16} className="text-indigo-400" />
            Security Scanning Results
          </h3>
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
            {fetchError
              ? 'Sync error'
              : `${visibleData.length} of ${filteredData.length} entries`}
          </span>
        </div>

        {/* Fallback – fetch error */}
        {fetchError && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
            <AlertTriangle size={40} className="text-amber-500/60" />
            <p className="font-bold text-sm uppercase tracking-widest">No patch data available</p>
            <p className="text-xs text-slate-600">Could not load patch data from the server</p>
          </div>
        )}

        {/* Fallback – empty after filter */}
        {!fetchError && filteredData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
            <ShieldCheck size={40} className="text-emerald-500/40" />
            <p className="font-bold text-sm uppercase tracking-widest">
              {allData.length === 0 ? 'No patch data available' : 'No matching records found'}
            </p>
          </div>
        )}

 {/* Table */}
{!fetchError && filteredData.length > 0 && (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[1800px]">
      <thead>
        <tr className="border-b border-slate-800/50 bg-slate-900/30">
          {ALL_COLUMNS.map((column) => (
            <th
              key={column.key}
              className={`px-4 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-500 ${column.minW}`}
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody className="text-sm">
        {visibleData.map((patch, i) => (
          <tr
            key={`${patch.package}-${i}`}
            className="group hover:bg-white/[0.025] transition-colors border-b border-slate-800/30"
          >
            {/* Package Name */}
            <td className="py-4 px-4 text-slate-200 font-medium">
              {patch.package}
            </td>

            {/* Category */}
            <td className="py-4 px-4 text-slate-300">
              {patch.category}
            </td>

            {/* Risk */}
            <td className="py-4 px-4">
              <RiskBadge risk={patch.risk} />
            </td>

            {/* CVE */}
            <td className="py-4 px-4 text-slate-400 font-mono">
              {patch.cve}
            </td>

            {/* EPSS */}
            <td className="py-4 px-4 text-cyan-400 font-semibold">
              {patch.epss}
            </td>

            {/* Severity */}
            <td className="py-4 px-4">
              <RiskBadge risk={patch.severity} />
            </td>

            {/* Description */}
            <td
              className="py-4 px-4 text-slate-400 text-xs max-w-[300px] truncate"
              title={patch.description}
            >
              {patch.description}
            </td>

            {/* Affected Dependencies */}
            <td className="py-4 px-4 text-slate-300 text-xs max-w-[220px] truncate"
                title={patch.affectedDependencies}>
              {patch.affectedDependencies}
            </td>

            {/* Affected OS */}
            <td className="py-4 px-4 text-slate-400">
              {patch.affectedOs}
            </td>

            {/* Date */}
            <td className="py-4 px-4 text-slate-500">
              {patch.date}
            </td>

            {/* Status */}
            <td className="py-4 px-4">
              <StatusBadge status={patch.status} />
            </td>

            {/* Action */}
            <td className="py-4 px-4">
              <button
                onClick={() => handleAnalyze(patch)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all duration-200"
              >
                <SquareDivide size={14} />
                {patch.action}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

        {/* View More footer */}
        {!fetchError && hasMore && (
          <div className="px-8 py-5 border-t border-slate-800/40 flex items-center justify-between bg-slate-900/10">
            <span className="text-xs text-slate-600">
              Showing {visibleData.length} of {filteredData.length} · {remaining} more available
            </span>
            <button
              id="view-more-patches"
              onClick={() => setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, filteredData.length))}
              className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all duration-200"
            >
              <ChevronDown size={16} />
              View More ({Math.min(LOAD_MORE_COUNT, remaining)} entries)
            </button>
          </div>
        )}

        {/* All loaded footer */}
        {!fetchError && !hasMore && filteredData.length > 0 && (
          <div className="px-8 py-4 border-t border-slate-800/40 text-center">
            <span className="text-xs text-slate-600 uppercase tracking-widest font-bold">
              All {filteredData.length} entries loaded
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
