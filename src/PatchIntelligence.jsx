import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, ShieldCheck, Clock, Search, Filter, CheckCircle, XCircle, Info, ChevronDown, AlertTriangle, SquareDivide } from 'lucide-react';
import { X } from 'lucide-react';

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

    scheduled: entry.scheduled || null,

    // Priority from excel/CSV: handle different casings
    priority: (() => {
      const raw = entry.priority ?? entry.Priority ?? entry.PriorityLevel ?? entry.PriorityLevel;
      const n = Number(raw);
      return Number.isFinite(n) ? n : 4; // 1..3 expected, fallback to 4 (unscheduled)
    })(),

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

function parseAffectedDependencies(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  const s = String(raw).trim();
  if (!s || s.toLowerCase() === 'none') return [];

  // try JSON array/object
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return parsed.map(String);
    if (parsed && typeof parsed === 'object') return Object.entries(parsed).map(([k, v]) => `${k}${v ? `@${v}` : ''}`);
  } catch (e) {
    // not json
  }

  // split on newlines, commas, semicolons, pipes
  const parts = s.split(/[\r\n,;|]+/).map(p => p.trim()).filter(Boolean);
  return parts;
}

function parsePriority(p) {
  if (p == null) return 4;
  // If already a finite number, use it (1..3 expected)
  if (typeof p === 'number' && Number.isFinite(p)) return p;
  // Try numeric coercion for string values
  const n = Number(p);
  if (Number.isFinite(n)) return Math.round(n);
  return 4;
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
  const [modalOpen, setModalOpen] = useState(false);
  const [activePatch, setActivePatch] = useState(null);
  const [ganttOpen, setGanttOpen] = useState(false);
  const [ganttTarget, setGanttTarget] = useState(null);
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
    // Open detailed approval modal
    setActivePatch(patch);
    setModalOpen(true);
  };

  const handleApprove = () => {
    if (!activePatch) return;
    // call backend to persist
    (async () => {
      try {
        const res = await fetch(`/api/patches/${encodeURIComponent(activePatch.package)}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ by: role }) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setAllData(prev => prev.map(p => p.package === activePatch.package ? { ...p, status: 'Approved', action: 'Approved' } : p));
        if (onShowToast) onShowToast(`${activePatch.package} approved`);
        setModalOpen(false);
      } catch (err) {
        console.error('Approve failed', err);
        if (onShowToast) onShowToast(`Approve failed: ${err.message}`);
      }
    })();
  };

  const handleReject = () => {
    if (!activePatch) return;
    (async () => {
      try {
        const res = await fetch(`/api/patches/${encodeURIComponent(activePatch.package)}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ by: role }) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setAllData(prev => prev.map(p => p.package === activePatch.package ? { ...p, status: 'Rejected', action: 'Rejected' } : p));
        if (onShowToast) onShowToast(`${activePatch.package} rejected`);
        setModalOpen(false);
      } catch (err) {
        console.error('Reject failed', err);
        if (onShowToast) onShowToast(`Reject failed: ${err.message}`);
      }
    })();
  };

  const handleShowSchedule = (patch) => {
    setGanttTarget(patch);
    setGanttOpen(true);
  };

  const buildSchedule = () => {
    // schedule SAFE risk rows using priority
    const safe = allData.filter(p => String(p.risk || '').toLowerCase() === 'safe');
    // split into already scheduled and unscheduled
    const scheduled = safe.filter(p => p.scheduled).map(p => ({ ...p, startDay: Number(p.scheduled.startDay) || 0, durationDays: Number(p.scheduled.durationDays) || 1 }));
    const unscheduled = safe.filter(p => !p.scheduled).slice().sort((a, b) => {
      const pa = parsePriority(a.priority);
      const pb = parsePriority(b.priority);
      if (pa !== pb) return pa - pb;
      return a.package.localeCompare(b.package);
    });

    // durations per priority: P1=3d, P2=2d, P3=1d, fallback 1
    const prToDur = pr => (pr === 1 ? 3 : pr === 2 ? 2 : pr === 3 ? 1 : 1);

    // place unscheduled after all scheduled ends
    const scheduledSorted = scheduled.slice().sort((a, b) => a.startDay - b.startDay);
    const lastScheduledEnd = scheduledSorted.reduce((mx, s) => Math.max(mx, s.startDay + s.durationDays), 0);
    let day = lastScheduledEnd;

    const assigned = unscheduled.map(s => {
      const pr = parsePriority(s.priority);
      const duration = prToDur(pr);
      const node = { ...s, startDay: day, durationDays: duration };
      day += duration;
      return node;
    });

    return [...scheduledSorted, ...assigned];
  };

  // helper for safe DOM ids
  const idFor = (pkg) => `gantt-node-${String(pkg || '').replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  // scroll gantt to highlighted node when opening
  useEffect(() => {
    if (!ganttOpen || !ganttTarget) return;
    const id = idFor(ganttTarget.package);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }, 50);
  }, [ganttOpen, ganttTarget]);

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
              {(() => {
                const isSafe = String(patch.risk || '').toLowerCase() === 'safe';
                const isScheduled = isSafe || patch.scheduled != null;
                const scheduledDay = patch.scheduled ? Number(patch.scheduled.startDay) + 1 : null;
                const label = isScheduled ? (scheduledDay ? `Update Scheduled · Day ${scheduledDay}` : 'Update Scheduled') : patch.action;
                return (
                  <button
                    onClick={() => isScheduled ? handleShowSchedule(patch) : handleAnalyze(patch)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isScheduled ? 'bg-emerald-600 text-white border border-emerald-500/20 hover:scale-105' : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white'} transition-all duration-200`}
                  >
                    <SquareDivide size={14} />
                    {label}
                  </button>
                );
              })()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

      {/* Approval Modal */}
      {modalOpen && activePatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-3xl mx-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-800/50 p-6 text-slate-200 shadow-2xl">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Patch approval — {activePatch.package}</h2>
                  <p className="text-sm text-slate-400 mt-1">{activePatch.description}</p>
                </div>
                <button className="text-slate-400 hover:text-white" onClick={() => setModalOpen(false)} aria-label="Close modal">
                  <X />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 uppercase font-black tracking-widest">Details</p>
                  <div className="text-sm text-slate-300">
                    <p><strong>Category:</strong> {activePatch.category}</p>
                    <p><strong>CVE:</strong> {activePatch.cve}</p>
                    <p><strong>Severity:</strong> {activePatch.severity}</p>
                    <p><strong>EPSS:</strong> {activePatch.epss}</p>
                    <p><strong>Affected OS:</strong> {activePatch.affectedOs}</p>
                    <p><strong>Date:</strong> {activePatch.date}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-400 uppercase font-black tracking-widest">Affected Dependencies</p>
                  <div className="text-sm text-slate-300 bg-slate-800/30 p-4 rounded-lg max-h-40 overflow-auto">
                    {(() => {
                      const deps = parseAffectedDependencies(activePatch.affectedDependencies);
                      if (deps.length === 0) return <p className="text-slate-500">No downstream packages affected.</p>;
                      return (
                        <div className="flex flex-wrap gap-2">
                          {deps.map((d, idx) => (
                            <span key={idx} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 text-sm text-slate-200 border border-slate-700">
                              <svg className="w-3 h-3 text-indigo-400" viewBox="0 0 8 8" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="4" cy="4" r="4" /></svg>
                              <span className="truncate max-w-[220px]">{d}</span>
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  <p className="text-xs text-slate-400 uppercase font-black tracking-widest">Potential Impact</p>
                  <div className="text-sm text-slate-300 bg-slate-800/20 p-3 rounded-lg">
                    <p>This update may change library ABI or require service restarts. Review change logs and schedule maintenance window if high severity.</p>
                  </div>
                </div>
              </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-slate-400">Role: <span className="text-slate-200 font-bold">{role}</span></div>
                  <div className="flex items-center gap-3">
                    {role === 'admin' ? (
                      <>
                        <button onClick={handleReject} className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition">Reject</button>
                        <button onClick={handleApprove} className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold">Approve</button>
                        <button onClick={() => handleShowSchedule(activePatch)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white">View Schedule</button>
                      </>
                    ) : (
                      <div className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 border border-slate-700">Only admins can modify and approve</div>
                    )}
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}

        {/* Gantt Modal */}
        {ganttOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setGanttOpen(false)} />
            <div className="relative w-full max-w-5xl mx-4">
              <div className="bg-slate-900 rounded-2xl border border-slate-800/50 p-6 text-slate-200 shadow-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Update Schedule</h3>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-slate-400">Showing SAFE updates</div>
                    <button className="text-slate-400 hover:text-white" onClick={() => setGanttOpen(false)} aria-label="Close gantt">Close</button>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-slate-400">Queue based on `Priority` column. Highlight shows selected update.</p>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <div className="flex items-end gap-6 py-6" style={{ minWidth: '800px' }}>
                    {buildSchedule().map((node, idx) => {
                      const isActive = ganttTarget && node.package === ganttTarget.package;
                      const width = Math.max(120, node.durationDays * 120);
                      return (
                        <div key={idx} className="flex flex-col items-center" style={{ minWidth: width }}>
                          <div
                            id={idFor(node.package)}
                            onClick={() => { setActivePatch(node); setModalOpen(true); setGanttTarget(node); }}
                            role="button"
                            tabIndex={0}
                            className={`h-12 w-full rounded-lg flex items-center justify-center cursor-pointer transition-transform ${isActive ? 'bg-indigo-500 text-white scale-105 ring-2 ring-indigo-400' : 'bg-slate-800 text-slate-300 hover:scale-105'}`}
                          >
                            <div className="text-sm font-semibold truncate px-2">{node.package}</div>
                          </div>
                          <div className="mt-3 text-xs text-slate-400">Day {node.startDay + 1} · {node.durationDays}d</div>
                        </div>
                      );
                    })}
                  </div>

                  {role === 'admin' && ganttTarget && (
                    <div className="mt-4 flex items-center justify-end gap-3">
                      <button
                        onClick={async () => {
                          try {
                            const pkg = ganttTarget.package;
                            const res = await fetch(`/api/patches/${encodeURIComponent(pkg)}/schedule`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ startDay: ganttTarget.startDay, durationDays: ganttTarget.durationDays }) });
                            if (!res.ok) throw new Error(`HTTP ${res.status}`);
                            const json = await res.json();
                            // update local state to reflect scheduled
                            setAllData(prev => prev.map(p => p.package === pkg ? { ...p, scheduled: json.scheduled, action: 'Update Scheduled' } : p));
                            if (onShowToast) onShowToast(`${pkg} scheduled`);
                          } catch (err) {
                            console.error('Schedule persist failed', err);
                            if (onShowToast) onShowToast(`Schedule failed: ${err.message}`);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
                      >Persist Schedule</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
