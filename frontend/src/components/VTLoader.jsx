import { useState, useEffect } from 'react';

const VTLoader = ({ loading, onDone }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      const t1 = setTimeout(() => setFadeOut(true), 0);
      const t2 = setTimeout(() => {
        setFadeOut(false);
        onDone?.();
      }, 400);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    const t = setTimeout(() => setFadeOut(false), 0);
    return () => clearTimeout(t);
  }, [loading, onDone]);

  if (!loading && !fadeOut) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-400 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-green rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-white font-bold text-2xl leading-none tracking-tight">VT</span>
          </div>
          <div className="absolute -inset-2 rounded-3xl border-2 border-brand-blue/20 animate-ping opacity-30" />
        </div>
        <div className="flex gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full bg-brand-blue animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-brand-green animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-brand-blue animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default VTLoader;