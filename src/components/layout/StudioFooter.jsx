import React from 'react';
import { GitBranch, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function StudioFooter({
  cursorPos,
  stats,
  lastSaved,
  currentTheme,
  setShowPrivacy,
}) {
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
