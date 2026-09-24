import React, { useState } from 'react';
import {
  Columns,
  Edit3,
  Eye,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  ChevronDown,
  Palette,
  Upload,
  Download,
  FileCheck,
  Copy,
  Code,
  Printer,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

export default function StudioHeader({
  sidebarOpen,
  setSidebarOpen,
  activeDoc,
  viewMode,
  setViewMode,
  currentTheme,
  currentThemeId,
  setCurrentThemeId,
  THEMES,
  TEMPLATES,
  createNewDocument,
  handleDownload,
  handleDownloadStandaloneHtml,
  copyMarkdown,
  copyHtml,
  fileInputRef,
  handleFileUpload,
  setShowHelp,
  setShowPrivacy,
  showToast,
}) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showThemes, setShowThemes] = useState(false);

  return (
    <header
      style={{
        backgroundColor: currentTheme.card,
        borderColor: currentTheme.border,
      }}
      className="h-12 border-b flex items-center justify-between px-3 z-30 select-none"
    >
      {/* Left: Branding & Breadcrumbs */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          style={{ borderColor: currentTheme.border }}
          className={`p-1.5 rounded border hover:bg-white/10 transition-colors ${
            sidebarOpen ? 'text-blue-400' : 'opacity-60'
          }`}
          title="Toggle Sidebar (Ctrl+B)"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-3.5 h-3.5" />
          ) : (
            <PanelLeft className="w-3.5 h-3.5" />
          )}
        </button>

        <div className="flex items-center space-x-1.5 font-bold tracking-tight">
          <span className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-mono font-black text-xs shadow">
            ⚡
          </span>
          <span className="font-extrabold tracking-tight text-sm">mdview</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-mono">
            STUDIO
          </span>
        </div>

        <div
          style={{ backgroundColor: currentTheme.border }}
          className="h-3.5 w-[1px] mx-1"
        />

        {/* Breadcrumb Path */}
        <div className="flex items-center space-x-1 opacity-70 text-[11px] font-mono">
          <span>workspace</span>
          <span>/</span>
          <span className="text-blue-400 font-semibold">{activeDoc?.title}</span>
        </div>
      </div>

      {/* Center: Layout View Mode Pills */}
      <div
        style={{
          backgroundColor: currentTheme.bg,
          borderColor: currentTheme.border,
        }}
        className="hidden sm:flex items-center p-0.5 rounded border space-x-0.5"
      >
        <button
          onClick={() => setViewMode('split')}
          className={`flex items-center space-x-1 px-2.5 py-0.5 text-[11px] font-semibold rounded transition-all ${
            viewMode === 'split' ? 'bg-blue-600 text-white' : 'opacity-60 hover:opacity-100'
          }`}
        >
          <Columns className="w-3 h-3" />
          <span>Split</span>
        </button>
        <button
          onClick={() => setViewMode('editor')}
          className={`flex items-center space-x-1 px-2.5 py-0.5 text-[11px] font-semibold rounded transition-all ${
            viewMode === 'editor' ? 'bg-blue-600 text-white' : 'opacity-60 hover:opacity-100'
          }`}
        >
          <Edit3 className="w-3 h-3" />
          <span>Editor</span>
        </button>
        <button
          onClick={() => setViewMode('preview')}
          className={`flex items-center space-x-1 px-2.5 py-0.5 text-[11px] font-semibold rounded transition-all ${
            viewMode === 'preview' ? 'bg-blue-600 text-white' : 'opacity-60 hover:opacity-100'
          }`}
        >
          <Eye className="w-3 h-3" />
          <span>Preview</span>
        </button>
      </div>

      {/* Right: Actions & Theme Picker */}
      <div className="flex items-center space-x-1">
        {/* Presets */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTemplates(!showTemplates);
              setShowThemes(false);
            }}
            style={{ borderColor: currentTheme.border }}
            className="flex items-center space-x-1 px-2 py-1 rounded border hover:bg-white/5 transition-colors text-[11px] font-medium"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Presets</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {showTemplates && (
            <div
              style={{
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
              }}
              className="absolute right-0 mt-1 w-64 rounded-lg shadow-xl border p-1.5 z-50 text-xs"
            >
              <div className="text-[10px] font-bold px-2 py-1 opacity-50 uppercase tracking-widest">
                Load Template into New Tab
              </div>
              {Object.entries(TEMPLATES).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => {
                    createNewDocument(key);
                    setShowTemplates(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-blue-600/20 transition-colors"
                >
                  <div className="font-semibold text-blue-400">{t.name}</div>
                  <div className="text-[10px] opacity-60 truncate">{t.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowThemes(!showThemes);
              setShowTemplates(false);
            }}
            style={{ borderColor: currentTheme.border }}
            className="flex items-center space-x-1 px-2 py-1 rounded border hover:bg-white/5 transition-colors text-[11px]"
            title="Switch Studio Theme"
          >
            <Palette className="w-3 h-3 text-indigo-400" />
            <span className="hidden md:inline">{currentTheme.name}</span>
          </button>

          {showThemes && (
            <div
              style={{
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
              }}
              className="absolute right-0 mt-1 w-52 rounded-lg shadow-xl border p-1.5 z-50 text-xs"
            >
              <div className="text-[10px] font-bold px-2 py-1 opacity-50 uppercase tracking-widest">
                Studio Theme
              </div>
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  onClick={() => {
                    setCurrentThemeId(th.id);
                    setShowThemes(false);
                    showToast(`Theme: ${th.name}`);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between ${
                    currentThemeId === th.id
                      ? 'bg-blue-600/20 text-blue-400 font-bold'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span>{th.name}</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/20"
                    style={{ backgroundColor: th.bg }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* File Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".md,.markdown,.txt"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{ borderColor: currentTheme.border }}
          className="p-1.5 rounded border hover:bg-white/5 transition-colors"
          title="Import Markdown File"
        >
          <Upload className="w-3.5 h-3.5 opacity-80" />
        </button>

        {/* Export Markdown Button */}
        <button
          onClick={handleDownload}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] shadow-sm transition-colors"
          title="Export .md (Ctrl+S)"
        >
          <Download className="w-3 h-3" />
          <span className="hidden md:inline">.md</span>
        </button>

        {/* Export Standalone HTML Button */}
        <button
          onClick={handleDownloadStandaloneHtml}
          style={{ borderColor: currentTheme.border }}
          className="flex items-center space-x-1 px-2 py-1 rounded border hover:bg-white/5 text-[11px] font-medium transition-colors"
          title="Export Standalone Offline HTML"
        >
          <FileCheck className="w-3 h-3 text-emerald-400" />
          <span className="hidden md:inline">HTML</span>
        </button>

        {/* Copy Markdown */}
        <button
          onClick={copyMarkdown}
          style={{ borderColor: currentTheme.border }}
          className="p-1.5 rounded border hover:bg-white/5 transition-colors"
          title="Copy Raw Markdown"
        >
          <Copy className="w-3.5 h-3.5 opacity-80" />
        </button>

        {/* Copy Rendered HTML */}
        <button
          onClick={copyHtml}
          style={{ borderColor: currentTheme.border }}
          className="p-1.5 rounded border hover:bg-white/5 transition-colors"
          title="Copy Clean Rendered HTML"
        >
          <Code className="w-3.5 h-3.5 opacity-80" />
        </button>

        {/* Print/PDF */}
        <button
          onClick={() => window.print()}
          style={{ borderColor: currentTheme.border }}
          className="p-1.5 rounded border hover:bg-white/5 transition-colors"
          title="Print or Export to PDF"
        >
          <Printer className="w-3.5 h-3.5 opacity-80" />
        </button>

        {/* Privacy, Security & Data Sovereignty */}
        <button
          onClick={() => setShowPrivacy && setShowPrivacy(true)}
          style={{ borderColor: currentTheme.border }}
          className="p-1.5 rounded border hover:bg-white/5 transition-colors text-emerald-400"
          title="Privacy, Security & Data Sovereignty"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
        </button>

        {/* Shortcuts Guide */}
        <button
          onClick={() => setShowHelp(true)}
          style={{ borderColor: currentTheme.border }}
          className="p-1.5 rounded border hover:bg-white/5 transition-colors text-blue-400"
          title="Shortcuts Guide (F1)"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
