import { useState, useEffect } from 'react';
import { X, Rocket, Server, ShieldCheck, CheckCircle2, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

const availablePatches = [
  { id: 'KB5037771', title: 'Security Update for Windows 11', severity: 'Critical' },
  { id: 'KB5037768', title: 'Cumulative Update for .NET Framework', severity: 'High' },
  { id: 'KB5036893', title: 'Service Stack Update v10.0.22621', severity: 'Medium' },
];

const targetGroups = [
  { id: 'prod', name: 'Production Servers (SRV-PROD-*)', count: 124 },
  { id: 'dev', name: 'Dev Workstations (WS-DEV-*)', count: 42 },
  { id: 'edge', name: 'Edge Nodes (Fleet-Zone-B)', count: 350 },
  { id: 'all', name: 'All Managed Nodes', count: 4520 },
];

export default function DeploymentModal({ onClose }) {
  const [step, setStep] = useState('config'); // config | deploying | success
  const [selectedGroup, setSelectedGroup] = useState('prod');
  const [selectedPatches, setSelectedPatches] = useState(['KB5037771']);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing...');

  const togglePatch = (id) => {
    setSelectedPatches(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleRunAutomation = () => {
    if (selectedPatches.length === 0) return;
    setStep('deploying');
  };

  useEffect(() => {
    if (step !== 'deploying') return;

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        setStatusText('Success! Deployment Complete.');
        clearInterval(interval);
        setTimeout(() => setStep('success'), 800);
      } else {
        setProgress(currentProgress);
        // Status mapping based on progress
        if (currentProgress < 25) setStatusText('Connecting via WinRM to target nodes...');
        else if (currentProgress < 50) setStatusText('Downloading KB Updates from WSUS...');
        else if (currentProgress < 75) setStatusText('Executing silent installer (DISM)...');
        else setStatusText('Verifying patch integrity & rebooting...');
      }
    }, 600);

    return () => clearInterval(interval);
  }, [step]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel border-slate-700/50 rounded-[2.5rem] w-full max-w-xl shadow-2xl shadow-black relative overflow-hidden animate-slide-up">
        
        {/* Progress Background Indicator */}
        {step === 'deploying' && (
          <div className="absolute top-0 left-0 h-1 bg-indigo-500 transition-all duration-500 z-50" style={{ width: `${progress}%` }}></div>
        )}

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-10">
          <X size={24} />
        </button>

        <div className="p-10">
          {step === 'config' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 animate-pulse">
                  <Rocket size={28} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white font-['Outfit',_sans-serif]">Run Deployment Automation</h2>
                  <p className="text-sm text-slate-500 font-medium">Configure and execute silent patch installation</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Target Group Dropdown */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Target Group</label>
                  <div className="relative">
                    <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <select 
                      value={selectedGroup} 
                      onChange={e => setSelectedGroup(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:ring-2 focus:ring-indigo-600 focus:bg-slate-900 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {targetGroups.map(g => (
                        <option key={g.id} value={g.id}>{g.name} — {g.count} nodes</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Patch Selection */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Select Patches to Deploy</label>
                  <div className="space-y-3">
                    {availablePatches.map(patch => (
                      <div 
                        key={patch.id} 
                        onClick={() => togglePatch(patch.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedPatches.includes(patch.id) 
                            ? 'bg-indigo-600/10 border-indigo-500/50' 
                            : 'bg-slate-950/30 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            selectedPatches.includes(patch.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-700 bg-slate-950'
                          }`}>
                            {selectedPatches.includes(patch.id) && <CheckCircle2 size={14} className="text-white" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{patch.id}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{patch.title}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          patch.severity === 'Critical' ? 'text-rose-400 bg-rose-500/10' : 'text-amber-400 bg-amber-500/10'
                        }`}>{patch.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 font-bold hover:bg-slate-800 hover:text-white transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={handleRunAutomation}
                  disabled={selectedPatches.length === 0}
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  Run Automation
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {step === 'deploying' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-10">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-lg font-bold text-white">{Math.round(progress)}%</p>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white font-['Outfit',_sans-serif] animate-pulse">Deploying...</h3>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 rounded-xl border border-slate-800/50">
                  <Loader2 size={16} className="text-indigo-400 animate-spin" />
                  <p className="text-sm font-mono text-indigo-300">{statusText}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 max-w-[280px]">Please do not close this window. PatchPilot is orchestrating WinRM sessions across {targetGroups.find(g => g.id === selectedGroup).count} nodes.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 size={48} className="text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-white font-['Outfit',_sans-serif]">Deployment Success!</h3>
                <p className="text-slate-400 font-medium">All targeted nodes are now in the verification stage.</p>
              </div>
              <div className="w-full bg-slate-950/50 border border-slate-800/50 rounded-3xl p-6 text-left">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800/50">
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Automation Summary</p>
                  <AlertCircle size={14} className="text-slate-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">Target Group</p>
                    <p className="text-sm font-bold text-white">{targetGroups.find(g => g.id === selectedGroup).name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">Patches Pushed</p>
                    <p className="text-sm font-bold text-indigo-400">{selectedPatches.length} KBs</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-emerald-600/30"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
