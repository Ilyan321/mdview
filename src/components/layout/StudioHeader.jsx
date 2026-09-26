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
  Search,
  Maximize2,
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
  setShowQuickOpen,
  toggleZenMode,
  showToast,
}) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showThemes, setShowThemes] = useState(false);

  const isDark = currentTheme.mode === 'dark';
  const activeTextColor = isDark ? 'text-blue-400' : 'text-blue-600';

  return (
    <header
      style={{
        backgroundColor: currentTheme.card,
        borderColor: currentTheme.border,
      }}
      className="h-12 border-b flex items-center justify-between px-3 z-30 select-none relative"
    >
      {/* Left: Branding & Breadcrumbs */}
      <div className="flex items-center space-x-2 shrink min-w-0 pr-2">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          style={{ borderColor: currentTheme.border }}
          className={`p-1.5 rounded border hover:bg-neutral-500/15 transition-colors shrink-0 ${
            sidebarOpen ? activeTextColor : 'opacity-60'
          }`}
          title="Toggle Sidebar (Ctrl+B)"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-3.5 h-3.5" />
          ) : (
            <PanelLeft className="w-3.5 h-3.5" />
          )}
        </button>

        <div className="flex items-center space-x-2 font-bold tracking-tight shrink-0">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm flex items-center justify-center border border-white/10">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 17V7l7 6 7-6v10" />
            </svg>
          </div>
          <span className="font-extrabold tracking-tight text-sm hidden sm:inline">mdview</span>
        </div>

        <div
          style={{ backgroundColor: currentTheme.border }}
          className="h-3.5 w-[1px] mx-1 shrink-0"
        />

        {/* Breadcrumb Path with proper truncation */}
        <div className="flex items-center space-x-1 opacity-70 text-[11px] font-mono shrink min-w-0">
          <span className="hidden sm:inline">workspace</span>
          <span className="hidden sm:inline">/</span>
          <span className={`${activeTextColor} font-semibold truncate max-w-[90px] sm:max-w-[140px] md:max-w-[200px]`}>
            {activeDoc?.title}
          </span>
        </div>

        {/* Quick Open Command Trigger */}
        <button
          onClick={() => setShowQuickOpen && setShowQuickOpen(true)}
          style={{ borderColor: currentTheme.border }}
          className="hidden md:flex items-center space-x-1.5 px-2 py-0.5 rounded border hover:bg-neutral-500/15 text-[11px] opacity-75 hover:opacity-100 transition-colors shrink-0 ml-1"
          title="Quick Open Documents (Ctrl+P / ⌘P)"
        >
          <Search className="w-3 h-3 text-blue-400" />
          <span className="hidden lg:inline text-[11px]">Quick Open</span>
          <kbd className="px-1 py-0.2 text-[9px] font-mono bg-neutral-500/20 rounded">
            Ctrl+P
          </kbd>
        </button>
      </div>

      {/* Center: Layout View Mode Pills */}
      <div
        style={{
          backgroundColor: currentTheme.bg,
          borderColor: currentTheme.border,
        }}
        className="flex items-center p-0.5 rounded border space-x-0.5 shrink-0"
      >
        <button
          onClick={() => setViewMode('split')}
          className={`hidden lg:flex items-center space-x-1 px-2.5 py-0.5 text-[11px] font-semibold rounded transition-all ${
            viewMode === 'split' ? 'bg-blue-600 text-white' : 'opacity-60 hover:opacity-100'
          }`}
          title="Split View"
        >
          <Columns className="w-3 h-3" />
          <span>Split</span>
        </button>
        <button
          onClick={() => setViewMode('editor')}
          className={`flex items-center space-x-1 px-2.5 py-0.5 text-[11px] font-semibold rounded transition-all ${
            viewMode === 'editor' ? 'bg-blue-600 text-white' : 'opacity-60 hover:opacity-100'
          }`}
          title="Editor View"
        >
          <Edit3 className="w-3 h-3" />
          <span className="hidden lg:inline">Editor</span>
        </button>
        <button
          onClick={() => setViewMode('preview')}
          className={`flex items-center space-x-1 px-2.5 py-0.5 text-[11px] font-semibold rounded transition-all ${
            viewMode === 'preview' ? 'bg-blue-600 text-white' : 'opacity-60 hover:opacity-100'
          }`}
          title="Preview View"
        >
          <Eye className="w-3 h-3" />
          <span className="hidden lg:inline">Preview</span>
        </button>
      </div>

      {/* Right: Actions & Theme Picker */}
      <div className="flex items-center space-x-1 shrink-0">
        {/* Presets */}
        <div className="relative hidden md:block">
          <button
            onClick={() => {
              setShowTemplates(!showTemplates);
              setShowThemes(false);
            }}
            style={{ borderColor: currentTheme.border }}
            className="flex items-center space-x-1 px-2 py-1 rounded border hover:bg-neutral-500/15 transition-colors text-[11px] font-medium"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Presets</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {showTemplates && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowTemplates(false)}
              />
              <div
                style={{
                  backgroundColor: currentTheme.card,
                  borderColor: currentTheme.border,
                  color: currentTheme.text,
                }}
                className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl border p-1.5 z-50 text-xs backdrop-blur-md"
              >
                <div className="text-[10px] font-bold px-2 py-1.5 opacity-50 uppercase tracking-widest border-b border-neutral-500/20 mb-1">
                  Load Template into New Tab
                </div>
                {Object.entries(TEMPLATES).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => {
                      createNewDocument(key);
                      setShowTemplates(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-600/20 transition-colors"
                  >
                    <div className="font-semibold text-blue-400">{t.name}</div>
                    <div className="text-[10px] opacity-60 truncate">{t.description}</div>
                  </button>
                ))}
              </div>
            </>
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
            className="flex items-center space-x-1.5 px-2 py-1 rounded border hover:bg-neutral-500/15 transition-colors text-[11px]"
            title={`Switch Studio Theme (${currentTheme.name})`}
          >
            <Palette className="w-3 h-3 text-indigo-400" />
            <span className="hidden xl:inline font-medium">{currentTheme.name}</span>
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
              style={{ backgroundColor: currentTheme.bg }}
            />
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {showThemes && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowThemes(false)}
              />
              <div
                style={{
                  backgroundColor: currentTheme.card,
                  borderColor: currentTheme.border,
                  color: currentTheme.text,
                }}
                className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl border p-1.5 z-50 text-xs backdrop-blur-md"
              >
                <div className="text-[10px] font-bold px-2 py-1.5 opacity-50 uppercase tracking-widest border-b border-neutral-500/20 mb-1 flex items-center justify-between">
                  <span>Studio Theme</span>
                  <span className="text-[9px] font-mono opacity-50">WCAG AAA</span>
                </div>
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      setCurrentThemeId(th.id);
                      setShowThemes(false);
                      showToast(`Theme: ${th.name}`);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      currentThemeId === th.id
                        ? 'bg-blue-600/20 text-blue-400 font-bold'
                        : 'hover:bg-neutral-500/15 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-3 h-3 rounded-full border border-white/20 shrink-0 shadow-sm"
                        style={{ backgroundColor: th.bg }}
                      />
                      <span className="text-xs">{th.name}</span>
                    </div>
                    {currentThemeId === th.id && (
                      <span className="text-xs text-blue-400 font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </>
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
          className="p-1.5 rounded border hover:bg-neutral-500/15 transition-colors"
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
          <span className="hidden sm:inline">.md</span>
        </button>

        {/* Export Standalone HTML Button */}
        <button
          onClick={handleDownloadStandaloneHtml}
          style={{ borderColor: currentTheme.border }}
          className="hidden md:flex items-center space-x-1 px-2 py-1 rounded border hover:bg-neutral-500/15 text-[11px] font-medium transition-colors"
          title="Export Standalone Offline HTML"
        >
          <FileCheck className="w-3 h-3 text-emerald-400" />
          <span className="hidden sm:inline">HTML</span>
        </button>

        {/* Copy Markdown (Hidden on smaller screens to prevent collision) */}
        <button
          onClick={copyMarkdown}
          style={{ borderColor: currentTheme.border }}
          className="hidden 2xl:flex p-1.5 rounded border hover:bg-neutral-500/15 transition-colors"
          title="Copy Raw Markdown"
        >
          <Copy className="w-3.5 h-3.5 opacity-80" />
        </button>

        {/* Copy Rendered HTML (Hidden on smaller screens to prevent collision) */}
        <button
          onClick={copyHtml}
          style={{ borderColor: currentTheme.border }}
          className="hidden 2xl:flex p-1.5 rounded border hover:bg-neutral-500/15 transition-colors"
          title="Copy Clean Rendered HTML"
        >
          <Code className="w-3.5 h-3.5 opacity-80" />
        </button>

        {/* Print/PDF */}
        <button
          onClick={() => window.print()}
          style={{ borderColor: currentTheme.border }}
          className="hidden md:flex p-1.5 rounded border hover:bg-neutral-500/15 transition-colors"
          title="Print or Export to PDF"
        >
          <Printer className="w-3.5 h-3.5 opacity-80" />
        </button>

        {/* Privacy, Security & Data Sovereignty */}
        <button
          onClick={() => setShowPrivacy && setShowPrivacy(true)}
          style={{ borderColor: currentTheme.border }}
          className="hidden md:flex p-1.5 rounded border hover:bg-neutral-500/15 transition-colors text-emerald-400"
          title="Privacy, Security & Data Sovereignty"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
        </button>

        {/* Distraction-Free Zen Mode */}
        {toggleZenMode && (
          <button
            onClick={toggleZenMode}
            style={{ borderColor: currentTheme.border }}
            className="hidden md:flex p-1.5 rounded border hover:bg-neutral-500/15 transition-colors text-amber-400"
            title="Distraction-Free Zen Mode (Alt+Z)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Shortcuts Guide */}
        <button
          onClick={() => setShowHelp(true)}
          style={{ borderColor: currentTheme.border }}
          className={`hidden md:flex p-1.5 rounded border hover:bg-neutral-500/15 transition-colors ${activeTextColor}`}
          title="Shortcuts Guide (F1)"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
