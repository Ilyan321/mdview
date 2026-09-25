import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { EditorView } from '@codemirror/view';
import { openSearchPanel, closeSearchPanel, searchPanelOpen } from '@codemirror/search';
import { Minimize2 } from 'lucide-react';
import { useDocumentStore } from './hooks/useDocumentStore';
import { useMarkdownPipeline } from './hooks/useMarkdownPipeline';
import StudioHeader from './components/layout/StudioHeader';
import TabBar from './components/layout/TabBar';
import StudioSidebar from './components/layout/StudioSidebar';
import EditorToolbar from './components/editor/EditorToolbar';
import CodeMirrorEditor from './components/editor/CodeMirrorEditor';
import MarkdownPreview from './components/preview/MarkdownPreview';
import StudioFooter from './components/layout/StudioFooter';
import HelpModal from './components/modals/HelpModal';
import PrivacyModal from './components/modals/PrivacyModal';
import QuickOpenModal from './components/modals/QuickOpenModal';
import { TEMPLATES } from './templates';

const THEMES = [
  { id: 'github-dark', name: 'GitHub Dark', mode: 'dark', bg: '#0d1117', card: '#161b22', border: '#30363d', accent: '#2f81f7', text: '#e6edf3' },
  { id: 'github-dark-hc', name: 'Dark High Contrast', mode: 'dark', bg: '#010409', card: '#0d1117', border: '#444c56', accent: '#4493f8', text: '#ffffff' },
  { id: 'vscode-dark', name: 'VS Code Modern', mode: 'dark', bg: '#181818', card: '#1f1f1f', border: '#2b2b2b', accent: '#0078d4', text: '#cccccc' },
  { id: 'github-light', name: 'GitHub Light', mode: 'light', bg: '#ffffff', card: '#f6f8fa', border: '#d0d7de', accent: '#0969da', text: '#1f2328' },
];

export default function App() {
  // --- Toast Notifications ---
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = useCallback((msg, icon = '✓') => {
    setToastMessage({ text: msg, icon });
    setTimeout(() => setToastMessage(null), 2400);
  }, []);

  // --- Document Store Hook ---
  const {
    documents,
    setDocuments,
    activeDocId,
    setActiveDocId,
    activeDoc,
    lastSaved,
    stats,
    updateActiveContent,
    createNewDocument,
    closeDocument,
    deleteDocument,
    renameDocument,
    exportAllDocumentsJson,
    importVaultBackupJson,
    purgeLocalVault,
  } = useDocumentStore(showToast);

  // --- UI Layout State ---
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState('explorer'); // 'explorer' | 'outline'
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'editor' | 'preview'
  const [splitRatio, setSplitRatio] = useState(50);
  const [syncScroll, setSyncScroll] = useState(() => {
    return localStorage.getItem('mdview_sync_scroll') === 'true'; // Defaults to false (independent scrolling)
  });
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    return localStorage.getItem('mdview_theme_id') || 'github-light';
  });
  const [showHelp, setShowHelp] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showQuickOpen, setShowQuickOpen] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // --- DOM Refs ---
  const editorViewRef = useRef(null);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const currentTheme = useMemo(() => {
    return THEMES.find((t) => t.id === currentThemeId) || THEMES[0];
  }, [currentThemeId]);

  // --- Markdown Pipeline Hook ---
  const { parsedHtml, outline } = useMarkdownPipeline(activeDoc?.content, currentTheme, previewRef);

  useEffect(() => {
    localStorage.setItem('mdview_theme_id', currentThemeId);
  }, [currentThemeId]);

  // --- Theme Syncing ---
  useEffect(() => {
    const root = document.documentElement;
    if (currentTheme.mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-color-mode', 'dark');
      root.setAttribute('data-dark-theme', currentTheme.id === 'github-dark-hc' ? 'dark_high_contrast' : 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-color-mode', 'light');
      root.setAttribute('data-light-theme', 'light');
    }

    const hljsLink = document.getElementById('hljs-theme');
    const markdownLink = document.getElementById('markdown-theme');
    
    if (currentTheme.mode === 'light') {
      if (hljsLink) hljsLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
      if (markdownLink) markdownLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown-light.min.css';
    } else {
      if (hljsLink) hljsLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
      if (markdownLink) markdownLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown-dark.min.css';
    }
  }, [currentTheme]);

  // --- Custom CodeMirror Theme Generator ---
  const cmCustomTheme = useMemo(() => {
    return EditorView.theme({
      '&': {
        height: '100%',
        backgroundColor: 'transparent !important',
        color: currentTheme.text,
        fontSize: '13.5px',
        fontFamily: "'JetBrains Mono', Menlo, Consolas, monospace",
      },
      '.cm-content': {
        fontFamily: "'JetBrains Mono', Menlo, Consolas, monospace",
        padding: '16px 8px',
        caretColor: currentTheme.accent,
      },
      '.cm-gutters': {
        backgroundColor: currentTheme.mode === 'dark' ? '#090d12' : '#f0f3f6',
        color: currentTheme.mode === 'dark' ? '#484f58' : '#8c959f',
        borderRight: `1px solid ${currentTheme.border}`,
        userSelect: 'none',
      },
      '.cm-activeLine': {
        backgroundColor: currentTheme.mode === 'dark' ? 'rgba(56, 139, 253, 0.08)' : 'rgba(9, 105, 218, 0.05)',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'transparent',
        color: currentTheme.accent,
        fontWeight: 'bold',
      },
      '.cm-selectionBackground': {
        backgroundColor: currentTheme.mode === 'dark' ? 'rgba(56, 139, 253, 0.35) !important' : 'rgba(9, 105, 218, 0.2) !important',
      },
      '.cm-content ::selection': {
        backgroundColor: currentTheme.mode === 'dark' ? 'rgba(56, 139, 253, 0.35) !important' : 'rgba(9, 105, 218, 0.2) !important',
        color: 'inherit !important',
      },
      '.cm-cursor': {
        borderLeftColor: currentTheme.accent,
        borderLeftWidth: '2px',
      },
      '.cm-panels': {
        backgroundColor: `${currentTheme.card} !important`,
        color: `${currentTheme.text} !important`,
        borderBottom: `1px solid ${currentTheme.border} !important`,
      },
      '.cm-panels-top': {
        borderBottom: `1px solid ${currentTheme.border} !important`,
      },
      '.cm-panel.cm-search': {
        backgroundColor: `${currentTheme.card} !important`,
        color: `${currentTheme.text} !important`,
        padding: '6px 12px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '6px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: '12px',
      },
      '.cm-search input.cm-textfield': {
        backgroundColor: `${currentTheme.bg} !important`,
        color: `${currentTheme.text} !important`,
        border: `1px solid ${currentTheme.border} !important`,
        borderRadius: '4px',
        padding: '3px 8px',
        fontSize: '12px',
        outline: 'none',
      },
      '.cm-search input.cm-textfield:focus': {
        borderColor: `${currentTheme.accent} !important`,
        boxShadow: `0 0 0 1px ${currentTheme.accent}`,
      },
      '.cm-search button.cm-button': {
        backgroundColor: currentTheme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08) !important' : 'rgba(0, 0, 0, 0.06) !important',
        color: `${currentTheme.text} !important`,
        border: `1px solid ${currentTheme.border} !important`,
        borderRadius: '4px',
        padding: '3px 8px',
        fontSize: '11px',
        fontWeight: '500',
        cursor: 'pointer',
        backgroundImage: 'none !important',
      },
      '.cm-search button.cm-button:hover': {
        backgroundColor: currentTheme.mode === 'dark' ? 'rgba(255, 255, 255, 0.15) !important' : 'rgba(0, 0, 0, 0.12) !important',
      },
      '.cm-search label': {
        color: `${currentTheme.text} !important`,
        opacity: '0.85',
        fontSize: '11px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer',
        marginRight: '6px',
      },
      '.cm-search label input[type="checkbox"]': {
        accentColor: currentTheme.accent,
      },
      '.cm-search button[name="close"]': {
        cursor: 'pointer',
        padding: '2px 6px',
        borderRadius: '4px',
        marginLeft: 'auto',
        opacity: '0.7',
      },
      '.cm-search button[name="close"]:hover': {
        opacity: '1',
        backgroundColor: 'rgba(239, 68, 68, 0.2) !important',
        color: '#ef4444 !important',
      },
      '.cm-search-matched': {
        backgroundColor: currentTheme.mode === 'dark' ? 'rgba(234, 179, 8, 0.35) !important' : 'rgba(250, 204, 21, 0.45) !important',
        borderRadius: '2px',
      },
      '.cm-search-matched.cm-selection': {
        backgroundColor: currentTheme.mode === 'dark' ? 'rgba(245, 158, 11, 0.7) !important' : 'rgba(217, 119, 6, 0.6) !important',
      },
    }, { dark: currentTheme.mode === 'dark' });
  }, [currentTheme]);

  // Jump to heading in editor & preview
  const jumpToLine = useCallback((lineNumber) => {
    if (editorViewRef.current) {
      const view = editorViewRef.current;
      const line = view.state.doc.line(Math.min(lineNumber, view.state.doc.lines));
      view.dispatch({
        selection: { anchor: line.from },
        scrollIntoView: true,
      });
      view.focus();
    }
  }, []);

  // --- Formatting Helpers ---
  const insertFormatting = useCallback((prefix, suffix = '', defaultPlaceholder = 'text') => {
    if (!editorViewRef.current) return;
    const view = editorViewRef.current;
    const state = view.state;
    const selection = state.selection.main;
    const selectedText = state.sliceDoc(selection.from, selection.to) || defaultPlaceholder;

    const replacement = `${prefix}${selectedText}${suffix}`;
    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert: replacement },
      selection: {
        anchor: selection.from + prefix.length,
        head: selection.from + prefix.length + selectedText.length,
      },
      scrollIntoView: true,
    });
    view.focus();
  }, []);

  const insertTable = useCallback(() => {
    const tableTemplate = `\n| Column 1 | Column 2 | Column 3 |\n| :--- | :---: | ---: |\n| Item Alpha | Active | $120.00 |\n| Item Beta | Inactive | $45.00 |\n\n`;
    insertFormatting('', '', tableTemplate);
  }, [insertFormatting]);

  const toggleSearchPanel = useCallback(() => {
    if (editorViewRef.current) {
      if (searchPanelOpen(editorViewRef.current.state)) {
        closeSearchPanel(editorViewRef.current);
      } else {
        openSearchPanel(editorViewRef.current);
      }
    }
  }, []);

  const toggleZenMode = useCallback(() => {
    setZenMode((prev) => {
      const next = !prev;
      showToast(next ? 'Zen Mode activated (Press Esc or Alt+Z to exit)' : 'Zen Mode deactivated');
      return next;
    });
  }, [showToast]);

  // --- Synchronized Scrolling ---
  const handleScrollUpdate = useCallback((view) => {
    if (!syncScroll || !previewRef.current) return;
    const scroller = view.scrollDOM;
    const preview = previewRef.current;
    const scrollPercentage = scroller.scrollTop / (scroller.scrollHeight - scroller.clientHeight || 1);
    preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
  }, [syncScroll]);

  const toggleSyncScroll = useCallback(() => {
    setSyncScroll((prev) => {
      const next = !prev;
      localStorage.setItem('mdview_sync_scroll', String(next));
      showToast(next ? 'Synchronized scrolling enabled' : 'Independent scrolling enabled');
      return next;
    });
  }, [showToast]);

  // --- Draggable Split Divider ---
  const handleMouseDown = useCallback(() => setIsDragging(true), []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newRatio = Math.max(20, Math.min(80, (offsetX / rect.width) * 100));
      setSplitRatio(newRatio);
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // --- Export Handlers ---
  const handleDownload = useCallback(() => {
    const blob = new Blob([activeDoc.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeDoc.title;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${activeDoc.title}`);
  }, [activeDoc, showToast]);

  const copyMarkdown = useCallback(() => {
    navigator.clipboard.writeText(activeDoc.content);
    showToast('Markdown copied to clipboard!');
  }, [activeDoc.content, showToast]);

  const copyHtml = useCallback(() => {
    navigator.clipboard.writeText(parsedHtml);
    showToast('Rendered HTML copied to clipboard!');
  }, [parsedHtml, showToast]);

  const handleDownloadStandaloneHtml = useCallback(() => {
    const isDark = currentTheme.mode === 'dark';
    const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activeDoc.title.replace(/\.md$/, '')}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown-${isDark ? 'dark' : 'light'}.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${isDark ? 'github-dark' : 'github'}.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px;
      background-color: ${currentTheme.bg};
      color: ${currentTheme.text};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    }
    .markdown-body {
      background-color: transparent !important;
      color: inherit !important;
    }
    .gh-alert { padding: 12px 16px; margin: 16px 0; border-left: 4px solid; border-radius: 6px; }
    .gh-alert-note { border-color: #2f81f7; background: rgba(56, 139, 253, 0.1); }
    .gh-alert-tip { border-color: #3fb950; background: rgba(46, 160, 67, 0.1); }
    .gh-alert-important { border-color: #a371f7; background: rgba(163, 113, 247, 0.1); }
    .gh-alert-warning { border-color: #d29922; background: rgba(187, 128, 9, 0.1); }
    .gh-alert-caution { border-color: #f85149; background: rgba(248, 81, 73, 0.1); }
    .studio-code-block { border: 1px solid #30363d; border-radius: 8px; overflow: hidden; margin: 16px 0; }
    .code-header { display: flex; justify-content: space-between; padding: 6px 12px; background: rgba(255,255,255,0.05); font-family: monospace; font-size: 11px; }
    .mermaid-container { background: rgba(0,0,0,0.2); border: 1px solid #30363d; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center; }
  </style>
</head>
<body class="markdown-body">
  <article>
    ${parsedHtml}
  </article>
  <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #30363d; font-size: 11px; opacity: 0.6; font-family: monospace;">
    Exported from mdview Studio • ${new Date().toLocaleDateString()}
  </footer>
  <script>
    if (window.mermaid) {
      mermaid.initialize({ startOnLoad: true, theme: '${isDark ? 'dark' : 'default'}' });
    }
  </script>
</body>
</html>`;

    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeDoc.title.replace(/\.md$/, '')}.html`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${link.download}`);
  }, [activeDoc, currentTheme, parsedHtml, showToast]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const newId = `doc-${Date.now()}`;
        const newDoc = {
          id: newId,
          title: file.name,
          content,
          isModified: false,
        };
        setDocuments((prev) => [...prev, newDoc]);
        setActiveDocId(newId);
        showToast(`Imported ${file.name}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [setDocuments, setActiveDocId, showToast]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setShowQuickOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleSearchPanel();
      }
      if (e.altKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        toggleZenMode();
      }
      if (e.key === 'Escape') {
        if (zenMode) {
          e.preventDefault();
          setZenMode(false);
          showToast('Exited Zen Mode');
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleDownload();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
      if (e.key === 'F1') {
        e.preventDefault();
        setShowHelp((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDoc, handleDownload, toggleSearchPanel, toggleZenMode, zenMode, showToast]);

  return (
    <div
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.text,
      }}
      className="flex flex-col h-screen overflow-hidden selection:bg-blue-600 selection:text-white"
    >
      {/* FLOATING ZEN MODE EXIT PILL */}
      {zenMode && (
        <div className="fixed top-3 right-4 z-40 animate-fade-in">
          <button
            onClick={() => setZenMode(false)}
            style={{
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
              color: currentTheme.text,
            }}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full border shadow-xl hover:bg-neutral-500/15 text-xs opacity-80 hover:opacity-100 transition-all backdrop-blur-md"
            title="Exit Zen Mode (Esc or Alt+Z)"
          >
            <Minimize2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-[11px]">Exit Zen</span>
            <kbd className="px-1.5 py-0.2 text-[9px] font-mono bg-neutral-500/20 rounded opacity-75">
              Esc
            </kbd>
          </button>
        </div>
      )}

      {/* 1. STUDIO HEADER */}
      {!zenMode && (
        <StudioHeader
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeDoc={activeDoc}
          viewMode={viewMode}
          setViewMode={setViewMode}
          currentTheme={currentTheme}
          currentThemeId={currentThemeId}
          setCurrentThemeId={setCurrentThemeId}
          THEMES={THEMES}
          TEMPLATES={TEMPLATES}
          createNewDocument={createNewDocument}
          handleDownload={handleDownload}
          handleDownloadStandaloneHtml={handleDownloadStandaloneHtml}
          copyMarkdown={copyMarkdown}
          copyHtml={copyHtml}
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
          setShowHelp={setShowHelp}
          setShowPrivacy={setShowPrivacy}
          setShowQuickOpen={setShowQuickOpen}
          toggleZenMode={toggleZenMode}
          showToast={showToast}
        />
      )}

      {/* 2. MAIN WORKSPACE BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLLAPSIBLE SIDEBAR */}
        {!zenMode && (
          <StudioSidebar
            sidebarOpen={sidebarOpen}
            sidebarTab={sidebarTab}
            setSidebarTab={setSidebarTab}
            documents={documents}
            setDocuments={setDocuments}
            activeDocId={activeDocId}
            setActiveDocId={setActiveDocId}
            createNewDocument={createNewDocument}
            deleteDocument={deleteDocument}
            outline={outline}
            jumpToLine={jumpToLine}
            currentTheme={currentTheme}
          />
        )}

        {/* CENTRAL WORKSPACE (TABS + SPLIT PANE) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* TAB BAR */}
          {!zenMode && (
            <TabBar
              documents={documents}
              activeDocId={activeDocId}
              setActiveDocId={setActiveDocId}
              closeDocument={closeDocument}
              createNewDocument={createNewDocument}
              currentTheme={currentTheme}
            />
          )}

          {/* FORMATTING TOOLBAR */}
          <EditorToolbar
            insertFormatting={insertFormatting}
            insertTable={insertTable}
            toggleSearchPanel={toggleSearchPanel}
            syncScroll={syncScroll}
            toggleSyncScroll={toggleSyncScroll}
            currentTheme={currentTheme}
          />

          {/* MAIN SPLIT CONTENT AREA */}
          <main
            ref={containerRef}
            className="flex-1 flex overflow-hidden relative"
          >
            {/* LEFT PANE: CodeMirror 6 Editor */}
            <CodeMirrorEditor
              activeDoc={activeDoc}
              updateActiveContent={updateActiveContent}
              cmCustomTheme={cmCustomTheme}
              editorViewRef={editorViewRef}
              setCursorPos={setCursorPos}
              handleScrollUpdate={handleScrollUpdate}
              viewMode={viewMode}
              splitRatio={splitRatio}
            />

            {/* CENTER RESIZER DIVIDER */}
            {viewMode === 'split' && (
              <div
                onMouseDown={handleMouseDown}
                style={{ backgroundColor: currentTheme.border }}
                className="w-1.5 h-full cursor-col-resize hover:bg-blue-500 transition-colors z-10 shrink-0 relative flex items-center justify-center group select-none"
              >
                <div className="h-8 w-1 bg-gray-400 group-hover:bg-white rounded-full transition-all" />
              </div>
            )}

            {/* RIGHT PANE: GitHub Markdown Preview */}
            <MarkdownPreview
              parsedHtml={parsedHtml}
              previewRef={previewRef}
              currentTheme={currentTheme}
              viewMode={viewMode}
              splitRatio={splitRatio}
            />
          </main>
        </div>
      </div>

      {/* 3. TELEMETRY STATUS BAR */}
      {!zenMode && (
        <StudioFooter
          cursorPos={cursorPos}
          stats={stats}
          lastSaved={lastSaved}
          currentTheme={currentTheme}
          setShowPrivacy={setShowPrivacy}
        />
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-8 right-6 z-50 bg-blue-600 text-white px-3.5 py-2 rounded-lg shadow-xl flex items-center space-x-2 text-xs font-semibold animate-slide-up border border-blue-400/30">
          <span>{toastMessage.icon}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS MODAL */}
      <HelpModal
        showHelp={showHelp}
        setShowHelp={setShowHelp}
        currentTheme={currentTheme}
      />

      {/* PRIVACY & DATA SOVEREIGNTY MODAL */}
      <PrivacyModal
        showPrivacy={showPrivacy}
        setShowPrivacy={setShowPrivacy}
        currentTheme={currentTheme}
        exportAllDocumentsJson={exportAllDocumentsJson}
        importVaultBackupJson={importVaultBackupJson}
        purgeLocalVault={purgeLocalVault}
      />

      {/* QUICK OPEN FUZZY DOCUMENT SWITCHER (Cmd/Ctrl+P) */}
      <QuickOpenModal
        isOpen={showQuickOpen}
        onClose={() => setShowQuickOpen(false)}
        documents={documents}
        activeDocId={activeDocId}
        onSelectDoc={(id) => setActiveDocId(id)}
        currentTheme={currentTheme}
      />
    </div>
  );
}
