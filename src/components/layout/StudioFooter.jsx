import React, { useState, useEffect } from 'react';
import { GitBranch, CheckCircle2, ShieldCheck, Wifi, WifiOff } from 'lucide-react';

export default function StudioFooter({
  cursorPos,
  stats,
  lastSaved,
  currentTheme,
  setShowPrivacy,
}) {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const isDark = currentTheme.mode === 'dark';
  const activeTextColor = isDark ? 'text-blue-400' : 'text-blue-600';

  return (
    <footer
      style={{
        backgroundColor: currentTheme.card,
        borderColor: currentTheme.border,
      }}
      className="h-6 border-t flex items-center justify-between px-3 text-[11px] select-none shrink-0 font-mono opacity-85 overflow-hidden"
    >
      {/* Left Telemetry */}
      <div className="flex items-center space-x-2.5 shrink min-w-0 pr-2">
        <span className={`flex items-center space-x-1 ${activeTextColor} shrink-0`}>
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </span>

        <span className="hidden lg:inline shrink-0">UTF-8</span>
        <span className="hidden lg:inline shrink-0">Spaces: 2</span>

        <span className="shrink-0 font-semibold">
          Ln {cursorPos.line}, Col {cursorPos.col}
        </span>

        <span className="hidden xl:inline text-[10px] px-1 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
          CodeMirror 6
        </span>

        {/* Privacy & Trust Badge */}
        <button
          onClick={() => setShowPrivacy && setShowPrivacy(true)}
          className="hidden sm:flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer px-1.5 py-0.2 rounded hover:bg-emerald-500/20 border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-sans font-medium shrink-0"
          title="Zero-Knowledge Privacy Guarantee & Cookie Disclosure"
        >
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Local-First • Zero Cookies</span>
        </button>

        {/* PWA Offline Readiness Badge */}
        <span
          className={`hidden md:flex items-center space-x-1 text-[10px] font-sans font-medium px-1.5 py-0.2 rounded border transition-colors shrink-0 ${
            isOnline
              ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
              : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
          }`}
          title={
            isOnline
              ? 'PWA Offline Ready: App shell and assets cached for offline use'
              : 'Offline Mode: Operating from local service worker cache'
          }
        >
          {isOnline ? (
            <Wifi className="w-2.5 h-2.5" />
          ) : (
            <WifiOff className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
          )}
          <span>{isOnline ? 'Offline Ready' : 'Offline'}</span>
        </span>
      </div>

      {/* Right Telemetry */}
      <div className="flex items-center space-x-2.5 shrink-0">
        <span className="hidden md:inline">{stats?.lines || 0} lines</span>
        <span>{stats?.words || 0} words</span>
        <span className="hidden sm:inline">{stats?.chars || 0} chars</span>
        <span className="hidden lg:inline">⏱️ ~{stats?.readingTime || 1} min</span>
        <span className="text-emerald-400 flex items-center space-x-1 shrink-0">
          <CheckCircle2 className="w-3 h-3" />
          <span>Saved {lastSaved?.toLocaleTimeString() || ''}</span>
        </span>
      </div>
    </footer>
  );
}
