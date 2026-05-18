import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = { success: CheckCircle, error: AlertTriangle, info: Info };
const styles = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  error:   'border-rose-500/30 bg-rose-500/10 text-rose-400',
  info:    'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
};

export default function Toast({ message, type = 'success', onDismiss }) {
  const [visible, setVisible] = useState(true);
  const Icon = icons[type];

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 300); }, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl shadow-black/40 backdrop-blur-md transition-all duration-300 ${styles[type]} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <Icon size={18} />
      <p className="text-sm font-bold text-white">{message}</p>
      <button onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
}
