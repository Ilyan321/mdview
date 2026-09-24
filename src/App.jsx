import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import {
  Columns,
  Eye,
  Edit3,
  Sun,
  Moon,
  Download,
  Upload,
  Copy,
  Check,
  Printer,
  Sparkles,
  RotateCcw,
  FileText,
  Bold,
  Italic,
  Strikethrough,
  Heading,
  List,
  CheckSquare,
  Code,
  Quote,
  Table as TableIcon,
  Link as LinkIcon,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Palette,
  X,
  Zap,
  Clock,
  Keyboard,
  Plus,
  Trash2,
  FolderOpen,
  FileCode,
  ListTree,
  PanelLeftClose,
  PanelLeft,
  GitBranch,
  Save,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { TEMPLATES } from './templates';

const THEMES = [
  { id: 'github-dark', name: 'GitHub Dark', mode: 'dark', bg: '#0d1117', card: '#161b22', border: '#30363d', accent: '#2f81f7', text: '#e6edf3' },
  { id: 'github-dark-hc', name: 'Dark High Contrast', mode: 'dark', bg: '#010409', card: '#0d1117', border: '#444c56', accent: '#4493f8', text: '#ffffff' },
  { id: 'vscode-dark', name: 'VS Code Modern', mode: 'dark', bg: '#181818', card: '#1f1f1f', border: '#2b2b2b', accent: '#0078d4', text: '#cccccc' },
  { id: 'github-light', name: 'GitHub Light', mode: 'light', bg: '#ffffff', card: '#f6f8fa', border: '#d0d7de', accent: '#0969da', text: '#1f2328' },
];

const INITIAL_DOCS = [
  {
    id: 'doc-1',
    title: 'README.md',
    content: TEMPLATES.readme.content,
    isModified: false,
  },
  {
    id: 'doc-2',
    title: 'ARCHITECTURE.md',
    content: TEMPLATES.spec.content,
    isModified: false,
  },
  {
    id: 'doc-3',
    title: 'SHOWCASE.md',
    content: TEMPLATES.showcase.content,
    isModified: false,
  }
];

export default function App() {
  // --- Multi-Document State ---
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem('mdview_studio_docs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DOCS;
  });

  const [activeDocId, setActiveDocId] = useState(() => {
    return localStorage.getItem('mdview_active_doc_id') || 'doc-1';
  });

  // --- Active Document Helper ---
  const activeDoc = useMemo(() => {
    return documents.find((d) => d.id === activeDocId) || documents[0] || INITIAL_DOCS[0];
  }, [documents, activeDocId]);

  // --- UI State ---
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState('explorer'); // 'explorer' | 'outline'
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'editor' | 'preview'
  const [splitRatio, setSplitRatio] = useState(50);
  const [syncScroll, setSyncScroll] = useState(true);
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    return localStorage.getItem('mdview_theme_id') || 'github-dark';
  });
  const [showTemplates, setShowTemplates] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [lastSaved, setLastSaved] = useState(new Date());

  // --- Refs ---
  const editorRef = useRef(null);
  const previewRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const currentTheme = useMemo(() => {
    return THEMES.find((t) => t.id === currentThemeId) || THEMES[0];
  }, [currentThemeId]);

  // --- Toast Notifications ---
  const showToast = (msg, icon = '✓') => {
    setToastMessage({ text: msg, icon });
    setTimeout(() => setToastMessage(null), 2400);
  };

  // --- Auto-Save to LocalStorage ---
  useEffect(() => {
    localStorage.setItem('mdview_studio_docs', JSON.stringify(documents));
    localStorage.setItem('mdview_active_doc_id', activeDocId);
    localStorage.setItem('mdview_theme_id', currentThemeId);
    setLastSaved(new Date());
  }, [documents, activeDocId, currentThemeId]);

  // --- Theme Syncing ---
  useEffect(() => {
    const root = document.documentElement;
    if (currentTheme.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const hljsLink = document.getElementById('hljs-theme');
    if (hljsLink) {
      if (currentTheme.id === 'github-light') {
        hljsLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
      } else {
        hljsLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
      }
    }
  }, [currentTheme]);

  // --- Document Operations ---
  const updateActiveContent = (newContent) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === activeDoc.id
          ? { ...doc, content: newContent, isModified: true }
          : doc
      )
    );
  };

  const updateActiveTitle = (newTitle) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === activeDoc.id
          ? { ...doc, title: newTitle }
          : doc
      )
    );
  };

  const createNewDocument = (templateKey = null) => {
    const tmpl = templateKey ? TEMPLATES[templateKey] : null;
    const newId = `doc-${Date.now()}`;
    const newDoc = {
      id: newId,
      title: tmpl ? `${tmpl.name.toLowerCase().replace(/\s+/g, '-')}.md` : `untitled-${documents.length + 1}.md`,
      content: tmpl ? tmpl.content : '# Untitled Document\n\nStart typing markdown here...',
      isModified: false,
    };
    setDocuments((prev) => [...prev, newDoc]);
    setActiveDocId(newId);
    setShowTemplates(false);
    showToast(`Created ${newDoc.title}`);
  };

  const closeDocument = (docId, e) => {
    e.stopPropagation();
    if (documents.length <= 1) {
      showToast('Cannot close the last open document', 'ℹ️');
      return;
    }
    const filtered = documents.filter((d) => d.id !== docId);
    setDocuments(filtered);
    if (activeDocId === docId) {
      setActiveDocId(filtered[filtered.length - 1].id);
    }
  };

  const deleteDocument = (docId, e) => {
    e.stopPropagation();
    if (documents.length <= 1) {
      showToast('Cannot delete the last document', 'ℹ️');
      return;
    }
    const docToDelete = documents.find((d) => d.id === docId);
    if (confirm(`Delete "${docToDelete?.title}"?`)) {
      closeDocument(docId, e);
      showToast(`Deleted ${docToDelete?.title}`);
    }
  };

  // --- Live Outline Extraction ---
  const outline = useMemo(() => {
    const lines = (activeDoc?.content || '').split('\n');
    const items = [];
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        items.push({
          level: match[1].length,
          text: match[2].trim(),
          lineNumber: index + 1,
        });
      }
    });
    return items;
  }, [activeDoc?.content]);

  // Jump to heading in editor & preview
  const jumpToLine = (lineNumber) => {
    if (!editorRef.current) return;
    const textarea = editorRef.current;
    const lines = textarea.value.split('\n');
    let targetIndex = 0;
    for (let i = 0; i < lineNumber - 1; i++) {
      targetIndex += lines[i].length + 1;
    }
    textarea.focus();
    textarea.setSelectionRange(targetIndex, targetIndex);
    const lineHeight = 24;
    textarea.scrollTop = Math.max(0, (lineNumber - 4) * lineHeight);
  };

  // --- Preprocess GitHub Callout Alerts ---
  const preprocessGitHubAlerts = (md) => {
    return md.replace(
      /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n((?:>.*(?:\n|$))*)/gim,
      (match, type, content) => {
        const cleanType = type.toUpperCase();
        const alertClasses = {
          NOTE: 'gh-alert gh-alert-note',
          TIP: 'gh-alert gh-alert-tip',
          IMPORTANT: 'gh-alert gh-alert-important',
          WARNING: 'gh-alert gh-alert-warning',
          CAUTION: 'gh-alert gh-alert-caution',
        };
        const alertTitles = {
          NOTE: 'Note',
          TIP: 'Tip',
          IMPORTANT: 'Important',
          WARNING: 'Warning',
          CAUTION: 'Caution',
        };
        const cleanContent = content
          .split('\n')
          .map((line) => line.replace(/^>\s?/, ''))
          .join('\n');

        return `<div class="${alertClasses[cleanType]}"><div class="flex items-center space-x-1.5 font-bold text-xs tracking-wider uppercase mb-1"><span>${alertTitles[cleanType]}</span></div><div>\n\n${cleanContent}\n\n</div></div>\n`;
      }
    );
  };

  // --- Markdown Parser ---
  const parsedHtml = useMemo(() => {
    try {
      const processed = preprocessGitHubAlerts(activeDoc?.content || '');

      marked.setOptions({
        gfm: true,
        breaks: true,
        highlight: (code, lang) => {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          try {
            return hljs.highlight(code, { language }).value;
          } catch {
            return hljs.highlightAuto(code).value;
          }
        },
      });

      const rawHtml = marked.parse(processed);
      return DOMPurify.sanitize(rawHtml, {
        ADD_ATTR: ['target', 'data-task-index'],
      });
    } catch (e) {
      return `<div class="p-4 text-red-400 bg-red-950/40 rounded border border-red-500/20">Render Error: ${e.message}</div>`;
    }
  }, [activeDoc?.content]);

  // --- Statistics ---
  const stats = useMemo(() => {
    const text = (activeDoc?.content || '').trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const lines = (activeDoc?.content || '').split('\n').length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, lines, readingTime };
  }, [activeDoc?.content]);

  // --- Cursor Tracking ---
  const handleEditorKeyUp = (e) => {
    const textarea = e.target;
    const start = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, start);
    const line = textBefore.split('\n').length;
    const col = start - textBefore.lastIndexOf('\n');
    setCursorPos({ line, col });
  };

  // --- Formatting Helpers ---
  const insertFormatting = (prefix, suffix = '', defaultPlaceholder = 'text') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = activeDoc.content;
    const selectedText = content.substring(start, end) || defaultPlaceholder;

    const before = content.substring(0, start);
    const after = content.substring(end);

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = `${before}${replacement}${after}`;
    updateActiveContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  const insertTable = () => {
    const tableTemplate = `\n| Column 1 | Column 2 | Column 3 |\n| :--- | :---: | ---: |\n| Item Alpha | Active | $120.00 |\n| Item Beta | Inactive | $45.00 |\n\n`;
    insertFormatting('', '', tableTemplate);
  };

  // --- Synchronized Scrolling ---
  const handleEditorScroll = () => {
    if (!editorRef.current) return;
    const editor = editorRef.current;

    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = editor.scrollTop;
    }

    if (syncScroll && previewRef.current) {
      const preview = previewRef.current;
      const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
      preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
    }
  };

  // --- Draggable Split Divider ---
  const handleMouseDown = () => setIsDragging(true);

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

  // --- Download File ---
  const handleDownload = () => {
    const blob = new Blob([activeDoc.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeDoc.title.endsWith('.md') ? activeDoc.title : `${activeDoc.title}.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${activeDoc.title}`);
  };

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(activeDoc.content);
      showToast('Markdown copied to clipboard!');
    } catch {
      showToast('Clipboard access denied', '✗');
    }
  };

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(parsedHtml);
      showToast('Rendered HTML copied to clipboard!');
    } catch {
      showToast('Clipboard access denied', '✗');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const newId = `doc-${Date.now()}`;
      const newDoc = {
        id: newId,
        title: file.name,
        content: event.target?.result || '',
        isModified: false,
      };
      setDocuments((prev) => [...prev, newDoc]);
      setActiveDocId(newId);
      showToast(`Imported ${file.name}`);
    };
    reader.readAsText(file);
  };

  // Keyboard Shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      insertFormatting('  ', '', '');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleDownload();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      setSidebarOpen((prev) => !prev);
    }
  };

  return (
    <div
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.text,
      }}
      className="flex flex-col h-screen w-full select-none antialiased overflow-hidden font-sans"
    >
      {/* ================= 1. STUDIO HEADER NAVBAR ================= */}
      <header
        style={{
          backgroundColor: currentTheme.card,
          borderColor: currentTheme.border,
        }}
        className="h-11 border-b flex items-center justify-between px-3 z-30 shrink-0 text-xs shadow-sm"
      >
        {/* Left: App Logo & Sidebar Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            style={{ borderColor: currentTheme.border }}
            className={`p-1.5 rounded border hover:bg-white/10 transition-colors ${sidebarOpen ? 'text-blue-400' : 'opacity-60'}`}
            title="Toggle Sidebar (Ctrl+B)"
          >
            {sidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeft className="w-3.5 h-3.5" />}
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

          <div style={{ backgroundColor: currentTheme.border }} className="h-3.5 w-[1px] mx-1" />

          {/* Breadcrumb Path */}
          <div className="flex items-center space-x-1 opacity-70 text-[11px] font-mono">
            <span>workspace</span>
            <span>/</span>
            <span className="text-blue-400 font-semibold">{activeDoc.title}</span>
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
          {/* Templates Dropdown */}
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
                    onClick={() => createNewDocument(key)}
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
                      currentThemeId === th.id ? 'bg-blue-600/20 text-blue-400 font-bold' : 'hover:bg-white/5'
                    }`}
                  >
                    <span>{th.name}</span>
                    <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: th.bg }} />
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

          {/* Export Button */}
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] shadow-sm transition-colors"
            title="Export .md (Ctrl+S)"
          >
            <Download className="w-3 h-3" />
            <span className="hidden md:inline">Export</span>
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

          {/* Print/PDF */}
          <button
            onClick={() => window.print()}
            style={{ borderColor: currentTheme.border }}
            className="p-1.5 rounded border hover:bg-white/5 transition-colors"
            title="Print or Export to PDF"
          >
            <Printer className="w-3.5 h-3.5 opacity-80" />
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

      {/* ================= 2. MAIN WORKSPACE BODY ================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLLAPSIBLE SIDEBAR */}
        {sidebarOpen && (
          <aside
            style={{
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
            }}
            className="w-64 border-r flex flex-col shrink-0 select-none z-20"
          >
            {/* Sidebar Tab Header */}
            <div
              style={{ borderColor: currentTheme.border }}
              className="h-9 border-b flex items-center px-2 space-x-1 text-xs font-semibold"
            >
              <button
                onClick={() => setSidebarTab('explorer')}
                className={`flex items-center space-x-1 px-2 py-1 rounded ${
                  sidebarTab === 'explorer' ? 'bg-white/10 text-blue-400' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Explorer</span>
              </button>
              <button
                onClick={() => setSidebarTab('outline')}
                className={`flex items-center space-x-1 px-2 py-1 rounded ${
                  sidebarTab === 'outline' ? 'bg-white/10 text-blue-400' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <ListTree className="w-3.5 h-3.5" />
                <span>Outline</span>
              </button>

              <div className="flex-1" />

              {/* Add New File Button */}
              {sidebarTab === 'explorer' && (
                <button
                  onClick={() => createNewDocument()}
                  className="p-1 rounded hover:bg-white/10 text-blue-400"
                  title="New File"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-2 text-xs font-mono">
              {sidebarTab === 'explorer' ? (
                /* Document Explorer List */
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold px-2 py-1 opacity-50 uppercase tracking-widest font-sans">
                    Open Files ({documents.length})
                  </div>
                  {documents.map((doc) => {
                    const isActive = doc.id === activeDoc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setActiveDocId(doc.id)}
                        className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30'
                            : 'hover:bg-white/5 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileCode className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          <input
                            type="text"
                            value={doc.title}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const title = e.target.value;
                              setDocuments((prev) =>
                                prev.map((d) => (d.id === doc.id ? { ...d, title } : d))
                              );
                            }}
                            className="bg-transparent focus:outline-none focus:border-b focus:border-blue-400 truncate max-w-[130px]"
                          />
                        </div>

                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {documents.length > 1 && (
                            <button
                              onClick={(e) => deleteDocument(doc.id, e)}
                              className="p-0.5 rounded hover:text-red-400"
                              title="Delete file"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Live Document Outline */
                <div className="space-y-1">
                  <div className="text-[10px] font-bold px-2 py-1 opacity-50 uppercase tracking-widest font-sans">
                    Table of Contents ({outline.length})
                  </div>
                  {outline.length === 0 ? (
                    <div className="p-2 text-xs opacity-50 italic">
                      No headings found. Add `# Header` to generate an outline.
                    </div>
                  ) : (
                    outline.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => jumpToLine(item.lineNumber)}
                        style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                        className="w-full text-left py-1 pr-2 rounded hover:bg-white/5 truncate flex items-center space-x-1.5 opacity-80 hover:opacity-100 hover:text-blue-400"
                        title={`Jump to Ln ${item.lineNumber}`}
                      >
                        <span className="text-[10px] opacity-50 font-bold">H{item.level}</span>
                        <span className="truncate">{item.text}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* CENTRAL WORKSPACE (TABS + SPLIT PANE) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* TAB BAR (VS CODE STYLE) */}
          <div
            style={{
              backgroundColor: currentTheme.bg,
              borderColor: currentTheme.border,
            }}
            className="h-9 border-b flex items-center px-1 overflow-x-auto select-none shrink-0"
          >
            {documents.map((doc) => {
              const isActive = doc.id === activeDoc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setActiveDocId(doc.id)}
                  style={{
                    backgroundColor: isActive ? currentTheme.card : 'transparent',
                    borderColor: currentTheme.border,
                  }}
                  className={`h-full flex items-center space-x-2 px-3 text-xs font-mono border-r border-t cursor-pointer transition-colors relative ${
                    isActive ? 'text-blue-400 font-semibold border-t-2 border-t-blue-500' : 'border-t-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[120px]">{doc.title}</span>

                  {/* Close Tab Button */}
                  <button
                    onClick={(e) => closeDocument(doc.id, e)}
                    className="p-0.5 rounded hover:bg-white/10 opacity-60 hover:opacity-100"
                    title="Close tab"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* Add Tab Button */}
            <button
              onClick={() => createNewDocument()}
              className="p-1.5 ml-1 rounded hover:bg-white/10 opacity-70 hover:opacity-100 text-blue-400"
              title="Add New Document"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* FORMATTING SUB-TOOLBAR */}
          <div
            style={{
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
            }}
            className="h-8 border-b flex items-center justify-between px-3 text-xs shrink-0"
          >
            <div className="flex items-center space-x-0.5 overflow-x-auto py-0.5">
              <button
                onClick={() => insertFormatting('# ', '', 'Heading 1')}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Heading 1"
              >
                <Heading className="w-3 h-3" />
              </button>
              <button
                onClick={() => insertFormatting('**', '**', 'bold text')}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-3 h-3" />
              </button>
              <button
                onClick={() => insertFormatting('*', '*', 'italic text')}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-3 h-3" />
              </button>
              <button
                onClick={() => insertFormatting('~~', '~~', 'strikethrough')}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Strikethrough"
              >
                <Strikethrough className="w-3 h-3" />
              </button>

              <div style={{ backgroundColor: currentTheme.border }} className="h-3.5 w-[1px] mx-1" />

              <button
                onClick={() => insertFormatting('> ', '', 'Quote text')}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Blockquote"
              >
                <Quote className="w-3 h-3" />
              </button>
              <button
                onClick={() => insertFormatting('```javascript\n', '\n```\n', '// Code snippet')}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Code Block"
              >
                <Code className="w-3 h-3" />
              </button>
              <button
                onClick={() => insertFormatting('[', '](https://example.com)', 'Link text')}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Insert Link"
              >
                <LinkIcon className="w-3 h-3" />
              </button>
              <button
                onClick={insertTable}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Insert Table"
              >
                <TableIcon className="w-3 h-3" />
              </button>
              <button
                onClick={() => insertFormatting('- [ ] ', '', 'Task item')}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Checklist Item"
              >
                <CheckSquare className="w-3 h-3" />
              </button>
            </div>

            {/* Sync Scroll Toggle */}
            <div className="flex items-center space-x-3 text-[11px]">
              <label className="flex items-center space-x-1.5 cursor-pointer opacity-70 hover:opacity-100">
                <input
                  type="checkbox"
                  checked={syncScroll}
                  onChange={(e) => setSyncScroll(e.target.checked)}
                  className="rounded border-gray-600 text-blue-600 focus:ring-0 w-3 h-3"
                />
                <span>Sync Scroll</span>
              </label>
            </div>
          </div>

          {/* MAIN SPLIT CONTENT AREA */}
          <main
            ref={containerRef}
            className="flex-1 flex overflow-hidden relative"
          >
            {/* LEFT PANE: Editor */}
            {(viewMode === 'split' || viewMode === 'editor') && (
              <div
                style={{
                  width: viewMode === 'split' ? `${splitRatio}%` : '100%',
                }}
                className="h-full flex relative overflow-hidden bg-transparent"
              >
                {/* Line Numbers Gutter */}
                <div
                  ref={lineNumbersRef}
                  style={{
                    backgroundColor: currentTheme.mode === 'dark' ? '#07090e' : '#f0f3f6',
                    borderColor: currentTheme.border,
                  }}
                  className="w-12 select-none text-right pr-2.5 py-4 font-mono text-xs overflow-hidden leading-relaxed shrink-0 border-r opacity-50"
                >
                  {Array.from({ length: stats.lines }).map((_, i) => (
                    <div key={i} className="h-6 leading-6">
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Textarea */}
                <textarea
                  ref={editorRef}
                  value={activeDoc.content}
                  onChange={(e) => updateActiveContent(e.target.value)}
                  onKeyUp={handleEditorKeyUp}
                  onClick={handleEditorKeyUp}
                  onScroll={handleEditorScroll}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste or type GitHub Flavored Markdown here..."
                  spellCheck={false}
                  className="flex-1 h-full w-full p-4 font-mono text-sm leading-6 resize-none focus:outline-none overflow-y-auto selection:bg-blue-600 selection:text-white bg-transparent"
                />
              </div>
            )}

            {/* CENTER RESIZER DIVIDER */}
            {viewMode === 'split' && (
              <div
                onMouseDown={handleMouseDown}
                style={{ backgroundColor: currentTheme.border }}
                className="w-1.5 h-full cursor-col-resize hover:bg-blue-500 transition-colors z-10 shrink-0 relative flex items-center justify-center group"
              >
                <div className="h-8 w-1 bg-gray-400 group-hover:bg-white rounded-full transition-all" />
              </div>
            )}

            {/* RIGHT PANE: GitHub Markdown Preview */}
            {(viewMode === 'split' || viewMode === 'preview') && (
              <div
                ref={previewRef}
                style={{
                  width: viewMode === 'split' ? `${100 - splitRatio}%` : '100%',
                  backgroundColor: currentTheme.bg,
                }}
                className="h-full overflow-y-auto"
              >
                <div
                  id="print-container"
                  className="markdown-body"
                  dangerouslySetInnerHTML={{ __html: parsedHtml }}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ================= 3. TELEMETRY STATUS BAR ================= */}
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
        </div>

        {/* Right Telemetry */}
        <div className="flex items-center space-x-3">
          <span>{stats.lines} lines</span>
          <span>{stats.words} words</span>
          <span>{stats.chars} chars</span>
          <span className="hidden sm:inline">⏱️ ~{stats.readingTime} min</span>
          <span className="text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Saved {lastSaved.toLocaleTimeString()}</span>
          </span>
        </div>
      </footer>

      {/* ================= TOAST NOTIFICATION ================= */}
      {toastMessage && (
        <div className="fixed bottom-8 right-6 z-50 bg-blue-600 text-white px-3.5 py-2 rounded-lg shadow-xl flex items-center space-x-2 text-xs font-semibold animate-slide-up border border-blue-400/30">
          <span>{toastMessage.icon}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ================= KEYBOARD SHORTCUTS MODAL ================= */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
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
                className="p-1 rounded hover:bg-white/10 opacity-70 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              {[
                { key: 'Ctrl + B', desc: 'Toggle Left Sidebar (Explorer / Outline)' },
                { key: 'Ctrl + S', desc: 'Export / Download active document' },
                { key: 'Tab', desc: 'Insert 2-space soft indent' },
                { key: 'F1 / ?', desc: 'Toggle Shortcuts Guide' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-white/5">
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
      )}
    </div>
  );
}
