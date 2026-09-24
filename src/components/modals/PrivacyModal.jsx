import React, { useRef } from 'react';
import {
  ShieldCheck,
  X,
  Cookie,
  HardDrive,
  Download,
  Upload,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export default function PrivacyModal({
  showPrivacy,
  setShowPrivacy,
  currentTheme,
  exportAllDocumentsJson,
  importVaultBackupJson,
  purgeLocalVault,
}) {
  const fileInputRef = useRef(null);

  if (!showPrivacy) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result);
        if (importVaultBackupJson) {
          importVaultBackupJson(json);
        }
      } catch (err) {
        alert('Invalid JSON backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div
        style={{
          backgroundColor: currentTheme.card,
          borderColor: currentTheme.border,
        }}
        className="w-full max-w-lg rounded-xl shadow-2xl border p-5 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-white">
                Privacy, Security & Data Sovereignty
              </h3>
              <p className="text-[11px] opacity-60">
                100% Local-First • Zero Cloud Storage • Zero Tracking
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPrivacy(false)}
            className="p-1 rounded hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Zero-Knowledge Client-Side Guarantee */}
        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Zero-Knowledge & Client-Side Execution</span>
          </div>
          <p className="text-[11px] opacity-80 leading-relaxed">
            All markdown parsing, KaTeX math rendering, and Mermaid diagram generation
            occur <strong>100% in your browser’s memory</strong>. Zero bytes of your
            notes, code snippets, or proprietary technical documents ever touch an
            external server or cloud database.
          </p>
        </div>

        {/* Section 2: Cookie & LocalStorage Disclosure */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-white">
            <Cookie className="w-3.5 h-3.5 text-amber-400" />
            <span>Cookie & Storage Transparency</span>
          </div>
          <div className="space-y-1.5 text-[11.5px] opacity-80 leading-relaxed">
            <p>
              • <strong>Zero Tracking Cookies:</strong> We do not set any tracking,
              profiling, or third-party advertising cookies.
            </p>
            <p>
              • <strong>LocalStorage Usage:</strong> Browser <code className="px-1 py-0.5 rounded bg-black/30 font-mono text-[10px]">localStorage</code> is
              used exclusively on your device to persist open document tabs,
              active document buffers, and studio theme preferences across page reloads.
            </p>
          </div>
        </div>

        {/* Section 3: Developer Verification */}
        <div className="p-3 rounded-lg bg-black/20 border border-white/5 space-y-1 text-xs">
          <div className="flex items-center space-x-1.5 font-semibold text-blue-400">
            <HardDrive className="w-3.5 h-3.5" />
            <span>How to Verify (Developer Proof)</span>
          </div>
          <p className="text-[11px] opacity-70 leading-relaxed font-mono">
            Open DevTools (<kbd className="px-1 py-0.5 rounded bg-white/10 text-[9px]">F12</kbd>) ➔ <strong>Network</strong> tab ➔ filter by <code className="text-blue-300">Fetch/XHR</code>. Type or edit any document in the studio: you will observe <strong>0 outbound HTTP requests</strong>.
          </p>
        </div>

        {/* Section 4: Data Vault Sovereignty Tools */}
        <div className="space-y-2 pt-1 border-t border-white/10">
          <div className="text-xs font-bold text-white flex items-center justify-between">
            <span>Data Sovereignty & Local Vault Tools</span>
            <span className="text-[10px] font-normal opacity-50 font-mono">Client-Side</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Export Vault Backup */}
            <button
              onClick={() => {
                if (exportAllDocumentsJson) exportAllDocumentsJson();
              }}
              style={{ borderColor: currentTheme.border }}
              className="flex items-center justify-center space-x-1.5 p-2 rounded-lg border hover:bg-white/5 transition-colors font-medium text-[11px]"
              title="Download all documents as JSON backup"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Backup Vault</span>
            </button>

            {/* Import Vault Backup */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ borderColor: currentTheme.border }}
              className="flex items-center justify-center space-x-1.5 p-2 rounded-lg border hover:bg-white/5 transition-colors font-medium text-[11px]"
              title="Restore documents from JSON backup"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Restore Vault</span>
            </button>

            {/* Wipe Local Storage */}
            <button
              onClick={() => {
                if (purgeLocalVault) purgeLocalVault();
              }}
              className="flex items-center justify-center space-x-1.5 p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors font-medium text-[11px]"
              title="Delete all cached documents and reset"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Wipe Cache</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={() => setShowPrivacy(false)}
            className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
