import { useState, useRef, useEffect } from 'react';
import { X, ShieldCheck, Zap, Clock, Phone, Mail, MessageSquare, CheckCircle, Send, Copy, Check } from 'lucide-react';

const features = [
  { icon: Clock, label: '24/7 Priority Response', desc: 'Guaranteed 1-hour SLA for critical issues' },
  { icon: Phone, label: 'Dedicated Support Line', desc: 'Direct hotline to your assigned engineer' },
  { icon: Zap, label: 'Proactive Patch Alerts', desc: 'Early warning on zero-days before public disclosure' },
  { icon: ShieldCheck, label: 'Compliance Reporting', desc: 'Monthly audit-ready reports (SOC2, ISO 27001)' },
];

const tickets = [
  { id: 'TKT-4821', subject: 'Patch rollback on SRV-DB-04', status: 'Resolved', date: 'May 14', color: 'text-emerald-400 bg-emerald-500/10' },
  { id: 'TKT-4799', subject: 'Edge-Fleet deployment timeout', status: 'In Progress', date: 'May 10', color: 'text-amber-400 bg-amber-500/10' },
  { id: 'TKT-4765', subject: 'MFA policy configuration', status: 'Resolved', date: 'May 3', color: 'text-emerald-400 bg-emerald-500/10' },
];

const botReplies = [
  "Hi Alex! 👋 I'm PatchPilot Support. How can I help you today?",
  "I'm checking that for you right now...",
  "Our engineers have been notified. Average response time is under 15 minutes for Gold tier.",
  "Is there anything else I can help you with?",
];

function LiveChatPanel({ onBack }) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: botReplies[0], time: 'Just now' },
  ]);
  const [input, setInput] = useState('');
  const [botIndex, setBotIndex] = useState(1);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input.trim(), time: 'Just now' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = botReplies[botIndex % botReplies.length];
      setMessages(prev => [...prev, { from: 'bot', text: reply, time: 'Just now' }]);
      setBotIndex(i => i + 1);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800/50 shrink-0">
        <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors text-xs font-bold">← Back</button>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><MessageSquare size={14} className="text-white" /></div>
          <div>
            <p className="text-sm font-bold text-white">PatchPilot Support</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>Online · Gold Priority</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
              m.from === 'user'
                ? 'bg-indigo-600 text-white rounded-br-sm'
                : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700/50'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
              {[0,1,2].map(i => (
                <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></span>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-5 py-4 border-t border-slate-800/50 shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Type your message..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-1 focus:ring-indigo-600 transition-all placeholder:text-slate-600"
          />
          <button onClick={send} className="p-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-600/20">
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmailPanel({ onBack }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    const s = encodeURIComponent(subject || 'Enterprise Gold Support Request');
    const b = encodeURIComponent(body || '');
    window.open(`mailto:support@patchpilot.io?subject=${s}&body=${b}`);
    setSent(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800/50 shrink-0">
        <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors text-xs font-bold">← Back</button>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center"><Mail size={14} className="text-white" /></div>
          <div>
            <p className="text-sm font-bold text-white">Email Support</p>
            <p className="text-[10px] text-slate-400">support@patchpilot.io · Gold SLA: 1hr</p>
          </div>
        </div>
      </div>
      <div className="flex-1 px-6 py-5 space-y-4 overflow-y-auto custom-scrollbar">
        {sent ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="p-5 bg-emerald-500/10 rounded-full text-emerald-400"><CheckCircle size={40} /></div>
            <p className="text-lg font-bold text-white">Email Client Opened!</p>
            <p className="text-sm text-slate-400 text-center">Your email draft is ready. Gold tier response within 1 hour.</p>
            <button onClick={onBack} className="mt-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all">Back to Support</button>
          </div>
        ) : (
          <>
            <div className="p-3 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl text-xs text-indigo-300 font-medium">
              🏅 <strong>Gold Priority</strong> — your ticket will be auto-escalated with 1-hour SLA.
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Describe your issue briefly..." className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-1 focus:ring-indigo-600 transition-all placeholder:text-slate-600" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={5} placeholder="Provide details about the issue, affected nodes, and steps already taken..." className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-1 focus:ring-indigo-600 transition-all placeholder:text-slate-600 resize-none" />
            </div>
            <button onClick={handleSend} className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20">
              <Mail size={16} /> Open in Email Client
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CallPanel({ onBack }) {
  const [copied, setCopied] = useState(false);
  const phone = '+1 (888) 728-2468';

  const copy = () => {
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800/50 shrink-0">
        <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors text-xs font-bold">← Back</button>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center"><Phone size={14} className="text-white" /></div>
          <div>
            <p className="text-sm font-bold text-white">Priority Hotline</p>
            <p className="text-[10px] text-emerald-400">24/7 · Gold Tier Access</p>
          </div>
        </div>
      </div>
      <div className="flex-1 px-6 py-6 flex flex-col gap-5">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-300 font-medium text-center">
          🟢 Hotline is currently <strong>active</strong> — average wait: &lt;2 min
        </div>
        <div className="bg-slate-950/60 border border-slate-800/50 rounded-3xl p-6 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Your Dedicated Hotline</p>
          <p className="text-3xl font-['Outfit',_sans-serif] font-bold text-white tracking-wide mb-1">{phone}</p>
          <p className="text-xs text-slate-500 mb-6">PIN: <span className="font-mono text-indigo-400 font-bold">4521</span> (your account ID)</p>
          <div className="flex gap-3">
            <button onClick={copy} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all border ${copied ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
              {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy Number</>}
            </button>
            <a href={`tel:${phone.replace(/\D/g, '')}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20">
              <Phone size={15} /> Call Now
            </a>
          </div>
        </div>
        <div className="space-y-2">
          {[['Mon–Fri', '9 AM – 9 PM', 'Primary hours'], ['Sat–Sun', '10 AM – 6 PM', 'Weekend support'], ['Critical Issues', 'Anytime 24/7', 'Gold SLA override']].map(([day, hrs, note], i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-900/40 rounded-2xl border border-slate-800/30">
              <div>
                <p className="text-sm font-bold text-white">{day}</p>
                <p className="text-[10px] text-slate-500">{note}</p>
              </div>
              <p className="text-xs font-bold text-indigo-400">{hrs}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SupportModal({ onClose }) {
  const [view, setView] = useState('main'); // 'main' | 'chat' | 'email' | 'call'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-[2rem] w-full max-w-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col" style={{ height: '90vh', maxHeight: '700px' }}>

        {view === 'main' && (
          <>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border-b border-slate-800/50 px-8 py-6 shrink-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.15),_transparent_60%)]"></div>
              <button onClick={onClose} className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors z-10"><X size={22} /></button>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-indigo-600/30 rounded-2xl border border-indigo-500/30"><ShieldCheck size={28} className="text-indigo-400" /></div>
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Active Plan</p>
                  <h2 className="text-2xl font-bold text-white font-['Outfit',_sans-serif]">Enterprise Gold</h2>
                  <p className="text-sm text-slate-400">Renewed annually · Next renewal: Jan 2025</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Status</p>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-black rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {/* Plan Features */}
              <div className="px-8 py-6 border-b border-slate-800/50">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Included Benefits</h3>
                <div className="grid grid-cols-2 gap-3">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/40 hover:border-indigo-500/20 transition-all group">
                      <div className="p-2 bg-indigo-600/10 rounded-xl text-indigo-400 group-hover:bg-indigo-600/20 transition-all shrink-0"><f.icon size={16} /></div>
                      <div>
                        <p className="text-sm font-bold text-white">{f.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Options */}
              <div className="px-8 py-6 border-b border-slate-800/50">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Contact Support</h3>
                <div className="flex gap-3">
                  <button onClick={() => setView('chat')} className="flex-1 flex flex-col items-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20">
                    <MessageSquare size={20} />
                    <span>Live Chat</span>
                    <span className="text-[10px] text-indigo-200 font-medium">Avg wait: &lt;2 min</span>
                  </button>
                  <button onClick={() => setView('email')} className="flex-1 flex flex-col items-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-all border border-slate-700/50">
                    <Mail size={20} />
                    <span>Email Support</span>
                    <span className="text-[10px] text-slate-400 font-medium">1-hr SLA</span>
                  </button>
                  <button onClick={() => setView('call')} className="flex-1 flex flex-col items-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-all border border-slate-700/50">
                    <Phone size={20} />
                    <span>Call Hotline</span>
                    <span className="text-[10px] text-emerald-400 font-medium">Live now</span>
                  </button>
                </div>
              </div>

              {/* Recent Tickets */}
              <div className="px-8 py-6">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Recent Tickets</h3>
                <div className="space-y-2">
                  {tickets.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800/40 rounded-2xl hover:border-slate-700/60 transition-all group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <CheckCircle size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                        <div>
                          <p className="text-sm font-bold text-white">{t.subject}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{t.id} · {t.date}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${t.color}`}>{t.status}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2.5 border border-slate-800 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-300 hover:border-slate-700 transition-all">View All Tickets →</button>
              </div>
            </div>
          </>
        )}

        {view === 'chat'  && <LiveChatPanel  onBack={() => setView('main')} />}
        {view === 'email' && <EmailPanel     onBack={() => setView('main')} />}
        {view === 'call'  && <CallPanel      onBack={() => setView('main')} />}

      </div>
    </div>
  );
}
