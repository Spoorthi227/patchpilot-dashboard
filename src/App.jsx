import { useState } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Server, 
  Activity, 
  Settings, 
  Search, 
  Bell, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Clock,
  LogOut
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import LoginPage from './LoginPage';
import DeploymentModal from './DeploymentModal';
import NotificationPanel from './NotificationPanel';
import ProfileDropdown from './ProfileDropdown';
import SupportModal from './SupportModal';
import Toast from './Toast';
import SecurityFeedModal from './SecurityFeedModal';
import PatchIntelligence from './PatchIntelligence';

const monthlyData = [
  { name: 'Jan', patches: 45, critical: 8 },
  { name: 'Feb', patches: 62, critical: 11 },
  { name: 'Mar', patches: 38, critical: 5 },
  { name: 'Apr', patches: 71, critical: 14 },
  { name: 'May', patches: 55, critical: 9 },
  { name: 'Jun', patches: 83, critical: 17 },
];

const patchData = [
  { id: 'KB5034765', title: 'Windows 11 Security Update', severity: 'Critical', date: '2024-05-14', status: 'Pending', impact: '124 nodes' },
  { id: 'KB5034467', title: 'Cumulative Update for .NET Framework', severity: 'High', date: '2024-05-10', status: 'Scheduled', impact: '3,200 nodes' },
  { id: 'KB5034123', title: 'Edge Browser Security Fix', severity: 'Medium', date: '2024-05-08', status: 'Installed', impact: '4,520 nodes' },
  { id: 'KB5033456', title: 'Windows Server 2022 Vulnerability Patch', severity: 'Critical', date: '2024-05-01', status: 'Missing', impact: '12 nodes' },
  { id: 'KB5032111', title: 'Defender Antivirus Definition Update', severity: 'Low', date: '2024-05-15', status: 'Installed', impact: '4,520 nodes' },
  { id: 'KB5031998', title: 'Office 365 Security Rollup', severity: 'High', date: '2024-05-12', status: 'Scheduled', impact: '1,105 nodes' },
];

const nodeData = [
  { name: 'WS-PROD-01', ip: '10.0.4.12', os: 'Windows 11 Pro', status: 'Online', health: '98%', lastSeen: '2m ago' },
  { name: 'SRV-DB-04', ip: '10.0.8.44', os: 'Windows Server 2022', status: 'Online', health: '100%', lastSeen: '15s ago' },
  { name: 'WS-DEV-12', ip: '192.168.1.104', os: 'Windows 10 Enterprise', status: 'Offline', health: '82%', lastSeen: '4h ago' },
  { name: 'SRV-WEB-02', ip: '10.0.2.15', os: 'Windows Server 2019', status: 'Online', health: '94%', lastSeen: '1m ago' },
  { name: 'WS-PROD-05', ip: '10.0.4.16', os: 'Windows 11 Pro', status: 'Online', health: '99%', lastSeen: '5m ago' },
  { name: 'SRV-LOG-01', ip: '10.0.9.11', os: 'Ubuntu 22.04 LTS', status: 'Online', health: '91%', lastSeen: '10s ago' },
  { name: 'WS-REMOTE-04', ip: '172.16.4.55', os: 'Windows 11 Pro', status: 'Online', health: '76%', lastSeen: '12m ago' },
];

const data = [
  { name: 'Mon', patches: 12, critical: 2 },
  { name: 'Tue', patches: 19, critical: 4 },
  { name: 'Wed', patches: 15, critical: 1 },
  { name: 'Thu', patches: 22, critical: 5 },
  { name: 'Fri', patches: 30, critical: 3 },
  { name: 'Sat', patches: 10, critical: 0 },
  { name: 'Sun', patches: 8, critical: 1 },
];

const activityData = [
  { id: 1, user: 'Alex Rivera', action: 'Deployed Patch KB5034765', target: 'Fleet-Zone-A', status: 'Success', time: '10m ago', icon: ShieldCheck, color: 'text-emerald-400' },
  { id: 2, user: 'System', action: 'Automated Scan Completed', target: '4,520 nodes', status: 'Completed', time: '1h ago', icon: Activity, color: 'text-blue-400' },
  { id: 3, user: 'Sarah Chen', action: 'Added New Deployment Group', target: 'Edge-Fleet-West', status: 'Success', time: '3h ago', icon: Server, color: 'text-purple-400' },
  { id: 4, user: 'System', action: 'Security Vulnerability Detected', target: 'SRV-DB-04', status: 'Critical', time: '5h ago', icon: AlertTriangle, color: 'text-rose-400' },
  { id: 5, user: 'Alex Rivera', action: 'Modified Policy: Auto-Approval', target: 'Global Policy', status: 'Updated', time: 'Yesterday', icon: Settings, color: 'text-amber-400' },
];

function downloadCSV(filename, headers, rows) {
  const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
function exportCSV() {
  downloadCSV('patchpilot-report.csv',
    'ID,Title,Severity,Date,Status,Impact',
    patchData.map(p => `${p.id},"${p.title}",${p.severity},${p.date},${p.status},${p.impact}`)
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [autoPatch, setAutoPatch] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showFeed, setShowFeed] = useState(false);
  const [toast, setToast] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('weekly');
  const [patchFilter, setPatchFilter] = useState('');
  const [scanning, setScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => { setScanning(false); showToast('Scan complete — 5 assets verified'); }, 2500);
  };

  const downloadAuditCSV = () => {
    downloadCSV('patchpilot-audit.csv',
      'Action,User,Target,Status,Time',
      activityData.map(a => `"${a.action}",${a.user},"${a.target}",${a.status},${a.time}`)
    );
    showToast('Audit log downloaded', 'info');
  };

  const filteredPatches = patchData.filter(p =>
    p.id.toLowerCase().includes(patchFilter.toLowerCase()) ||
    p.title.toLowerCase().includes(patchFilter.toLowerCase()) ||
    p.severity.toLowerCase().includes(patchFilter.toLowerCase())
  );

  const filteredNodes = searchQuery
    ? nodeData.filter(n =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.ip.includes(searchQuery) ||
        n.os.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : nodeData;

  const handleLogin = (role) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const stats = [
    { title: 'System Health', value: '98.2%', change: '+0.4%', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Active Patches', value: '1,284', change: '+12', icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Open Vulns', value: '42', change: '-5', icon: ShieldAlert, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { title: 'Managed Nodes', value: '4,520', change: '+8', icon: Server, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-['Inter',_sans-serif]">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-800/50 flex flex-col bg-slate-950/80 backdrop-blur-xl">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="font-['Outfit',_sans-serif] font-bold text-2xl tracking-tight text-white">PatchPilot</span>
        </div>

        <nav className="flex-1 px-6 py-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'intelligence', label: 'Patch Intelligence', icon: ShieldCheck },
            { id: 'inventory', label: 'Asset Inventory', icon: Server },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 scale-[1.02]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <item.icon size={22} />
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 space-y-3">
          {/* Enterprise Gold Card */}
          <div className="relative rounded-3xl overflow-hidden border border-indigo-500/20 shadow-2xl">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-slate-900 to-purple-900/50"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-500/20 rounded-full blur-xl"></div>

            <div className="relative z-10 p-5">
              {/* Header Row */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[9px] text-indigo-300/70 uppercase tracking-[0.25em] font-black mb-1">Support Plan</p>
                  <p className="text-base font-['Outfit',_sans-serif] font-bold text-white leading-tight">Enterprise Gold</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/25 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Active</span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">SLA</p>
                  <p className="text-sm font-bold text-white">1-hr Response</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Nodes</p>
                  <p className="text-sm font-bold text-white">4,520 covered</p>
                </div>
              </div>

              {/* Renewal */}
              <div className="flex items-center justify-between mb-4 px-1">
                <p className="text-[10px] text-slate-500 font-medium">Renews Jan 2025</p>
                <p className="text-[10px] font-black text-amber-400">234 days left</p>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setShowSupport(true)}
                className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white text-xs font-bold rounded-xl transition-all border border-indigo-500/30 hover:border-indigo-400/60 hover:shadow-lg hover:shadow-indigo-600/20"
              >
                View Priority Support →
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-2xl transition-all text-sm font-bold border border-transparent hover:border-rose-500/10"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-float"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none animate-float" style={{ animationDelay: '1s' }}></div>

        {/* Header */}
        <header className="h-24 border-b border-slate-800/50 flex items-center justify-between px-10 bg-slate-950/40 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-8">
            <div className="relative w-[450px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search nodes, patches, or IP addresses..."
                className="w-full bg-slate-900/50 border border-slate-800/50 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-600 focus:bg-slate-900 outline-none transition-all placeholder:text-slate-600"
              />
            </div>
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-800/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-400">All Systems Nominal</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Bell */}
            <button
              onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
              className={`p-3 border rounded-2xl transition-all relative group ${
                showNotif ? 'text-white bg-slate-900 border-indigo-500/50' : 'text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-900 border-slate-800/50'
              }`}>
              <Bell size={22} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-slate-950"></span>
            </button>
            <div className="h-10 w-[1px] bg-slate-800/50 mx-1"></div>
            {/* Profile */}
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
              className="flex items-center gap-4 pl-2 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Alex Rivera</p>
                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{userRole === 'admin' ? 'Security Admin' : 'Node Operator'}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 flex items-center justify-center font-bold text-white shadow-xl shadow-indigo-600/20 transition-all border ${
                showProfile ? 'scale-110 border-indigo-400/60' : 'border-white/10 group-hover:scale-105'
              }`}>
                {userRole === 'admin' ? 'AR' : 'NU'}
              </div>
            </button>
          </div>
          {/* Dropdowns */}
          {showNotif && <NotificationPanel onClose={() => setShowNotif(false)} />}
          {showProfile && (
            <ProfileDropdown
              userRole={userRole}
              onLogout={() => { setShowProfile(false); handleLogout(); }}
              onSettings={() => setActiveTab('settings')}
              onClose={() => setShowProfile(false)}
            />
          )}
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar relative z-10 bg-grid">
          {activeTab === 'dashboard' && (
            <div className="animate-slide-up space-y-10">
              {/* Welcome section */}
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-['Outfit',_sans-serif] font-bold text-white mb-3 text-glow">
                    {userRole === 'admin' ? 'Systems Overview' : 'Node Dashboard'}
                  </h1>
                  <p className="text-slate-400 font-medium text-lg">
                    {userRole === 'admin' 
                      ? 'Everything is looking good. 12 patches scheduled for today.' 
                      : 'All assigned nodes are healthy. 0 critical alerts for your zone.'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={exportCSV} className="px-6 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">Export Report</button>
                  {userRole === 'admin' ? (
                    <button onClick={() => setShowModal(true)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">New Deployment</button>
                  ) : (
                    <button className="px-6 py-2.5 bg-slate-800 text-slate-500 rounded-xl text-sm font-bold cursor-not-allowed border border-slate-700/50 flex items-center gap-2">
                      <ShieldAlert size={16} /> Request Approval
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="glass-card p-7 rounded-[2rem] group">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shadow-inner`}>
                        <stat.icon size={28} />
                      </div>
                      <span className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-1.5 rounded-lg ${
                        stat.change.startsWith('+') ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {stat.change}
                        {stat.change.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold mb-2 uppercase tracking-widest">{stat.title}</p>
                    <p className="text-3xl font-['Outfit',_sans-serif] font-bold text-white tracking-tight">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts & Tables */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Chart Area */}
                <div className="xl:col-span-2 glass-panel rounded-[2.5rem] p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-3xl rounded-full"></div>
                  <div className="flex justify-between items-center mb-10 relative z-10">
                    <div>
                      <h3 className="text-2xl font-['Outfit',_sans-serif] font-bold text-white">Patching Activity</h3>
                      <p className="text-sm text-slate-500 font-medium">System-wide deployment metrics</p>
                    </div>
                    <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800/50">
                      {['weekly','monthly'].map(p => (
                        <button key={p} onClick={() => setChartPeriod(p)}
                          className={`px-4 py-1.5 text-xs font-bold capitalize rounded-xl transition-all ${
                            chartPeriod === p ? 'text-white bg-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                          }`}>{p}</button>
                      ))}
                    </div>
                  </div>
                  <div className="h-[350px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartPeriod === 'weekly' ? data : monthlyData} margin={{ left: -20, right: 10 }}>
                        <defs>
                          <linearGradient id="colorPatches" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#64748b" 
                          fontSize={11} 
                          fontWeight={600}
                          tickLine={false} 
                          axisLine={false} 
                          dy={10}
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={11} 
                          fontWeight={600}
                          tickLine={false} 
                          axisLine={false} 
                          dx={-10}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '20px', backdropFilter: 'blur(10px)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                          itemStyle={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="patches" 
                          stroke="#6366f1" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorPatches)" 
                          animationDuration={2000}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="critical" 
                          stroke="#f43f5e" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorCritical)" 
                          animationDuration={2000}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Alerts */}
                <div className="glass-panel rounded-[2.5rem] p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-['Outfit',_sans-serif] font-bold text-white">Security Feed</h3>
                    <button onClick={() => setShowFeed(true)} className="text-indigo-400 text-sm font-bold hover:text-indigo-300 transition-all hover:scale-105">Explore Feed →</button>
                  </div>
                  <div className="space-y-5">
                    {[
                      { msg: 'Zero-day vulnerability in Nginx v1.2.4', time: '2m ago', type: 'critical', icon: AlertTriangle },
                      { msg: 'Kernel update required on Node-42 (US-East)', time: '45m ago', type: 'warning', icon: Clock },
                      { msg: 'Auto-patching successful on 12 nodes', time: '2h ago', type: 'success', icon: ShieldCheck },
                      { msg: 'New deployment group created: Edge-Fleet', time: '5h ago', type: 'info', icon: LayoutDashboard },
                    ].map((alert, i) => (
                      <div key={i} className="flex gap-5 p-4 rounded-3xl hover:bg-slate-800/40 transition-all cursor-pointer group border border-transparent hover:border-slate-700/50">
                        <div className={`mt-1 p-3 rounded-2xl h-fit shadow-lg ${
                          alert.type === 'critical' ? 'bg-rose-500/10 text-rose-500' :
                          alert.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                          alert.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          <alert.icon size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200 leading-snug mb-1.5 group-hover:text-white transition-colors tracking-tight">{alert.msg}</p>
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{alert.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-10 p-6 bg-indigo-600/10 border border-indigo-600/20 rounded-[2rem] relative overflow-hidden group hover:bg-indigo-600/15 transition-all">
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-600/10 rounded-full blur-2xl group-hover:blur-xl transition-all"></div>
                    <div className="flex items-center gap-3 text-indigo-400 mb-3">
                      <ShieldCheck size={20} />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">Security Protocol</span>
                    </div>
                    <p className="text-[13px] text-slate-300 leading-relaxed font-medium">
                      Multi-factor authentication is now mandatory for all node access requests in the <span className="text-white font-bold">Edge Deployment</span> zone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'intelligence' && (
            <PatchIntelligence role={userRole} onShowToast={showToast} />
          )}

          {activeTab === 'inventory' && (
            <div className="animate-slide-up space-y-10">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-['Outfit',_sans-serif] font-bold text-white mb-3 text-glow">Asset Inventory</h1>
                  <p className="text-slate-400 font-medium text-lg">Live inventory of managed nodes and endpoints</p>
                </div>
                {userRole === 'admin' && (
                  <button onClick={handleScan} disabled={scanning}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-105 active:scale-95">
                    {scanning ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Server size={18} />}
                    {scanning ? 'Scanning...' : 'Scan New Assets'}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4">
                {filteredNodes.length === 0 && (
                  <div className="py-12 text-center text-slate-600 font-bold">No nodes match your search.</div>
                )}
                {filteredNodes.map((node, i) => (
                  <div key={i} className="glass-card flex items-center justify-between p-6 rounded-3xl group cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl ${node.status === 'Online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800/50 text-slate-600'} group-hover:scale-110 transition-transform`}>
                        <Server size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors">{node.name}</h4>
                        <p className="text-xs font-mono text-slate-500">{node.ip} • {node.os}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Health</p>
                        <p className={`text-sm font-bold ${parseInt(node.health) > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{node.health}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Last Seen</p>
                        <p className="text-sm font-bold text-slate-300">{node.lastSeen}</p>
                      </div>
                      <div className="w-32 text-right">
                        <span className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${
                          node.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'Online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></div>
                          {node.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="animate-slide-up space-y-10">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-['Outfit',_sans-serif] font-bold text-white mb-3 text-glow">Activity Log</h1>
                  <p className="text-slate-400 font-medium text-lg">Real-time audit trail of all system actions</p>
                </div>
                {userRole === 'admin' && (
                  <button onClick={downloadAuditCSV} className="px-6 py-3 bg-slate-900 border border-slate-800/50 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl">Download Audit CSV</button>
                )}
              </div>
              <div className="space-y-4">
                {activityData.map((activity) => (
                  <div key={activity.id} className="glass-card flex items-center justify-between p-6 rounded-3xl group">
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl bg-slate-950/50 ${activity.color} group-hover:rotate-12 transition-transform`}>
                        <activity.icon size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg leading-tight group-hover:text-indigo-400 transition-colors">{activity.action}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">{activity.user} • {activity.target}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <p className="text-sm font-bold text-slate-400">{activity.time}</p>
                      <span className="px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-slide-up max-w-4xl space-y-8">
              <h1 className="text-4xl font-['Outfit',_sans-serif] font-bold text-white mb-10 text-glow">Settings</h1>
              
              {/* Profile Section */}
              <div className="glass-panel rounded-[2.5rem] p-8">
                <h3 className="text-xl font-bold text-white mb-6">Account Profile</h3>
                <div className="flex items-center gap-8">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-3xl font-bold text-white shadow-2xl">
                    AR
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                      <input type="text" defaultValue="Alex Rivera" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm focus:ring-1 focus:ring-indigo-600 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Role</label>
                      <input type="text" readOnly value="Security Admin" className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-500 cursor-not-allowed outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Deployment Settings */}
              <div className="glass-panel rounded-[2.5rem] p-8">
                <h3 className="text-xl font-bold text-white mb-6">Deployment Preferences</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-950/30 rounded-2xl border border-slate-800/30 hover:border-indigo-500/20 transition-all group">
                    <div>
                      <p className="font-bold text-white">Automated Patching</p>
                      <p className="text-xs text-slate-500">Enable system-wide automated security updates</p>
                    </div>
                    <button 
                      onClick={() => setAutoPatch(!autoPatch)}
                      className={`w-12 h-6 rounded-full transition-all relative ${autoPatch ? 'bg-indigo-600' : 'bg-slate-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${autoPatch ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/30">
                    <div>
                      <p className="font-bold text-white">Email Notifications</p>
                      <p className="text-xs text-slate-500">Receive alerts for critical vulnerabilities</p>
                    </div>
                    <button 
                      onClick={() => setEmailNotif(!emailNotif)}
                      className={`w-12 h-6 rounded-full transition-all relative ${emailNotif ? 'bg-indigo-600' : 'bg-slate-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${emailNotif ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-10">
                <button onClick={() => showToast('Changes discarded', 'info')} className="px-8 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all">Cancel</button>
                <button onClick={() => showToast('Settings saved successfully!')} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20">Save Changes</button>
              </div>
            </div>
          )}
        </div>
      </main>
      {showModal && <DeploymentModal onClose={() => setShowModal(false)} />}
      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
      {showFeed && <SecurityFeedModal onClose={() => setShowFeed(false)} />}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}

export default App;
