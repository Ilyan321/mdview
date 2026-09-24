import React from 'react';
import { Keyboard, X } from 'lucide-react';

export default function HelpModal({ showHelp, setShowHelp, currentTheme }) {
  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div
        style={{
          backgroundColor: currentTheme.card,
          borderColor: currentTheme.border,
        }}
        className="w-full max-w-md rounded-xl shadow-2xl border p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold text-sm">
            <Keyboard className="w-4 h-4 text-blue-400" />
            <span>Studio Shortcuts</span>
          </div>
          <button
            onClick={() => setShowHelp(false)}
            className="p-1 rounded hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5 text-xs">
          {[
            { key: 'Ctrl + P', desc: 'Quick Open Document Palette' },
            { key: 'Ctrl + F', desc: 'Find in Editor' },
            { key: 'Ctrl + H', desc: 'Find & Replace in Editor' },
            { key: 'Alt + Z', desc: 'Toggle Distraction-Free Zen Mode' },
            { key: 'Ctrl + B', desc: 'Toggle Left Sidebar (Explorer / Outline)' },
            { key: 'Ctrl + S', desc: 'Export / Download active document' },
            { key: 'Tab', desc: 'CodeMirror 2-space soft indent' },
            { key: 'F1', desc: 'Studio Shortcuts Guide' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1 border-b border-white/5"
            >
              <span className="opacity-80">{item.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-black/20 font-mono text-[11px] font-semibold border border-white/10">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowHelp(false)}
          className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
