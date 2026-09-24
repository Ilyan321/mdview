import React from 'react';
import { GitBranch, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function StudioFooter({
  cursorPos,
  stats,
  lastSaved,
  currentTheme,
  setShowPrivacy,
}) {
  return (
    <footer
      style={{
        backgroundColor: currentTheme.card,
        borderColor: currentTheme.border,
      }}
      className="h-6 border-t flex items-center justify-between px-3 text-[11px] select-none shrink-0 font-mono opacity-80"
    >
      {/* Left Telemetry */}
      <div className="flex items-center space-x-3">
        <span className="flex items-center space-x-1 text-blue-400">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </span>
        <span>UTF-8</span>
        <span>Spaces: 2</span>
        <span>
          Ln {cursorPos.line}, Col {cursorPos.col}
        </span>
        <span className="text-[10px] px-1 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
          CodeMirror 6
        </span>

        {/* Privacy & Trust Badge */}
        <button
          onClick={() => setShowPrivacy && setShowPrivacy(true)}
          className="hidden md:flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-emerald-500/20 border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-sans font-medium"
          title="Zero-Knowledge Privacy Guarantee & Cookie Disclosure"
        >
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Local-First • Zero Cookies</span>
        </button>
      </div>

      {/* Right Telemetry */}
      <div className="flex items-center space-x-3">
        <span>{stats?.lines || 0} lines</span>
        <span>{stats?.words || 0} words</span>
        <span>{stats?.chars || 0} chars</span>
        <span className="hidden sm:inline">⏱️ ~{stats?.readingTime || 1} min</span>
        <span className="text-emerald-400 flex items-center space-x-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Saved {lastSaved?.toLocaleTimeString() || ''}</span>
        </span>
      </div>
    </footer>
  );
}
