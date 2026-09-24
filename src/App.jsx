import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Split,
  ChevronDown,
  Palette,
  Layers,
  Search,
  X,
  Zap,
  Clock,
  Keyboard,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { TEMPLATES } from './templates';

const THEMES = [
  { id: 'github-dark', name: 'GitHub Dark', mode: 'dark', bg: '#0d1117', card: '#161b22', border: '#30363d', accent: '#2f81f7', text: '#e6edf3' },
  { id: 'github-light', name: 'GitHub Light', mode: 'light', bg: '#ffffff', card: '#f6f8fa', border: '#d0d7de', accent: '#0969da', text: '#1f2328' },
  { id: 'tokyo-night', name: 'Tokyo Night', mode: 'dark', bg: '#1a1b26', card: '#16161e', border: '#292e42', accent: '#7aa2f7', text: '#c0caf5' },
  { id: 'dracula', name: 'Dracula', mode: 'dark', bg: '#282a36', card: '#21222c', border: '#44475a', accent: '#bd93f9', text: '#f8f8f2' },
  { id: 'cyberpunk', name: 'Cyberpunk', mode: 'dark', bg: '#09090b', card: '#121216', border: '#27272a', accent: '#00f0ff', text: '#ffffff' },
];

export default function App() {
  // --- State ---
  const [markdown, setMarkdown] = useState(() => {
    const saved = localStorage.getItem('mdview_doc_content');
    return saved !== null ? saved : TEMPLATES.readme.content;
  });
  const [docTitle, setDocTitle] = useState(() => {
    return localStorage.getItem('mdview_doc_title') || 'README.md';
  });
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    return localStorage.getItem('mdview_theme_id') || 'github-dark';
  });
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'preview' | 'editor'
  const [splitRatio, setSplitRatio] = useState(50);
  const [syncScroll, setSyncScroll] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [lastSaved, setLastSaved] = useState(new Date());
  const [isFocusMode, setIsFocusMode] = useState(false);

  // --- Refs ---
  const editorRef = useRef(null);
  const previewRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const currentTheme = useMemo(() => {
    return THEMES.find((t) => t.id === currentThemeId) || THEMES[0];
  }, [currentThemeId]);

  // --- Toast Notification Helper ---
  const showToast = (msg, icon = '✓') => {
    setToastMessage({ text: msg, icon });
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // --- Auto-Save ---
  useEffect(() => {
    localStorage.setItem('mdview_doc_content', markdown);
    localStorage.setItem('mdview_doc_title', docTitle);
    localStorage.setItem('mdview_theme_id', currentThemeId);
    setLastSaved(new Date());
  }, [markdown, docTitle, currentThemeId]);

  // --- Apply Theme ---
  useEffect(() => {
    const root = document.documentElement;
    const isDark = currentTheme.mode === 'dark';
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const hljsLink = document.getElementById('hljs-theme');
    if (hljsLink) {
      if (currentTheme.id === 'github-light') {
        hljsLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
      } else if (currentTheme.id === 'dracula') {
        hljsLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/dracula.min.css';
      } else if (currentTheme.id === 'tokyo-night') {
        hljsLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/tokyo-night-dark.min.css';
      } else {
        hljsLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
      }
    }
  }, [currentTheme]);

  // --- Preprocess GitHub Callouts ---
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

        return `<div class="${alertClasses[cleanType]}"><div class="flex items-center space-x-1.5 font-semibold text-xs tracking-wider uppercase mb-1"><span>${alertTitles[cleanType]}</span></div><div>\n\n${cleanContent}\n\n</div></div>\n`;
      }
    );
  };

  // --- Markdown Parser ---
  const parsedHtml = useMemo(() => {
    try {
      const processed = preprocessGitHubAlerts(markdown);

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
  }, [markdown]);

  // --- Statistics ---
  const stats = useMemo(() => {
    const text = markdown.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const lines = markdown.split('\n').length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, lines, readingTime };
  }, [markdown]);

  // --- Toolbar Insert Helpers ---
  const insertFormatting = (prefix, suffix = '', defaultPlaceholder = 'text') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end) || defaultPlaceholder;

    const before = markdown.substring(0, start);
    const after = markdown.substring(end);

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newMarkdown = `${before}${replacement}${after}`;
    setMarkdown(newMarkdown);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  const insertTable = () => {
    const tableTemplate = `\n| Item | Description | Status |\n| :--- | :--- | :---: |\n| Feature A | High-performance parser | ✅ Ready |\n| Feature B | Responsive layout | ✅ Ready |\n\n`;
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

  // --- Clipboard Actions ---
  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      showToast('Raw Markdown copied to clipboard!');
    } catch {
      showToast('Clipboard permission denied', '✗');
    }
  };

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(parsedHtml);
      showToast('Rendered HTML copied to clipboard!');
    } catch {
      showToast('Clipboard permission denied', '✗');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = docTitle.endsWith('.md') ? docTitle : `${docTitle}.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Saved ${docTitle}`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocTitle(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setMarkdown(event.target?.result || '');
      showToast(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  };

  const loadTemplate = (templateKey) => {
    const tmpl = TEMPLATES[templateKey];
    if (tmpl) {
      setMarkdown(tmpl.content);
      setDocTitle(`${tmpl.name.toLowerCase().replace(/\s+/g, '-')}.md`);
      setShowTemplates(false);
      showToast(`Loaded "${tmpl.name}" template`);
    }
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
      insertFormatting('**', '**', 'bold text');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      insertFormatting('*', '*', 'italic text');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      insertFormatting('[', '](https://example.com)', 'Link text');
    }
    if (e.key === 'F1' || (e.shiftKey && e.key === '?')) {
      e.preventDefault();
      setShowHelp((prev) => !prev);
    }
  };

  return (
    <div
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.text,
      }}
      className="flex flex-col h-screen w-full select-none antialiased overflow-hidden font-sans transition-colors duration-200"
    >
      {/* ================= TOP NAVBAR ================= */}
      {!isFocusMode && (
        <header
          style={{
            backgroundColor: currentTheme.card,
            borderColor: currentTheme.border,
          }}
          className="h-14 border-b flex items-center justify-between px-4 z-20 shrink-0 shadow-sm backdrop-blur-md bg-opacity-95"
        >
          {/* Left: Branding & Document Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2.5 font-bold text-base tracking-tight group cursor-pointer">
              <div className="relative">
                <span className="p-1.5 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-200">
                  <Zap className="w-4 h-4 fill-white" />
                </span>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-blue-600 animate-pulse" />
              </div>
              <span className="font-extrabold tracking-tight text-lg bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
                mdview
              </span>
            </div>

            <div style={{ backgroundColor: currentTheme.border }} className="h-4 w-[1px]" />

            {/* Document Title Input */}
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md hover:bg-black/10 dark:hover:bg-white/5 transition-colors">
              <FileText className="w-3.5 h-3.5 opacity-60" />
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="text-xs font-semibold bg-transparent focus:outline-none border-b border-transparent focus:border-blue-500 max-w-[140px] sm:max-w-[200px] truncate"
                title="Click to rename document"
              />
            </div>
          </div>

          {/* Center: Layout View Mode Pills */}
          <div
            style={{
              backgroundColor: currentTheme.bg,
              borderColor: currentTheme.border,
            }}
            className="hidden md:flex items-center p-1 rounded-lg border shadow-inner space-x-1"
          >
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'split'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'opacity-70 hover:opacity-100 hover:bg-white/5'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode('editor')}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'editor'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'opacity-70 hover:opacity-100 hover:bg-white/5'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'opacity-70 hover:opacity-100 hover:bg-white/5'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {/* Right: Actions, Presets & Themes */}
          <div className="flex items-center space-x-1.5">
            {/* Template Presets */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTemplates(!showTemplates);
                  setShowThemes(false);
                }}
                style={{ borderColor: currentTheme.border }}
                className="flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border hover:bg-white/5 transition-all shadow-sm active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Templates</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showTemplates && (
                <div
                  style={{
                    backgroundColor: currentTheme.card,
                    borderColor: currentTheme.border,
                  }}
                  className="absolute right-0 mt-2 w-72 rounded-xl shadow-2xl border p-2 z-50 animate-slide-up"
                >
                  <div className="text-[10px] font-bold px-2 py-1 opacity-50 uppercase tracking-widest">
                    Quick Starter Templates
                  </div>
                  {Object.entries(TEMPLATES).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => loadTemplate(key)}
                      className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-blue-600/15 transition-all group"
                    >
                      <div className="font-semibold text-blue-400 group-hover:text-blue-300">{t.name}</div>
                      <div className="text-[11px] opacity-70 truncate">{t.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Picker */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowThemes(!showThemes);
                  setShowTemplates(false);
                }}
                style={{ borderColor: currentTheme.border }}
                className="flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border hover:bg-white/5 transition-all shadow-sm active:scale-95"
                title="Change Color Theme"
              >
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">{currentTheme.name}</span>
              </button>

              {showThemes && (
                <div
                  style={{
                    backgroundColor: currentTheme.card,
                    borderColor: currentTheme.border,
                  }}
                  className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl border p-2 z-50 animate-slide-up"
                >
                  <div className="text-[10px] font-bold px-2 py-1 opacity-50 uppercase tracking-widest">
                    Select Theme
                  </div>
                  {THEMES.map((th) => (
                    <button
                      key={th.id}
                      onClick={() => {
                        setCurrentThemeId(th.id);
                        setShowThemes(false);
                        showToast(`Switched to ${th.name}`);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors ${
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

            {/* File Upload / Open */}
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
              className="p-1.5 rounded-lg border hover:bg-white/5 transition-all active:scale-95"
              title="Open Local Markdown File"
            >
              <Upload className="w-4 h-4 opacity-80 hover:opacity-100" />
            </button>

            {/* Export Markdown */}
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              title="Export .md (Ctrl+S)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Copy Markdown */}
            <button
              onClick={copyMarkdown}
              style={{ borderColor: currentTheme.border }}
              className="p-1.5 rounded-lg border hover:bg-white/5 transition-all active:scale-95"
              title="Copy Raw Markdown"
            >
              <Copy className="w-4 h-4 opacity-80" />
            </button>

            {/* Copy Rendered HTML */}
            <button
              onClick={copyHtml}
              style={{ borderColor: currentTheme.border }}
              className="p-1.5 rounded-lg border hover:bg-white/5 transition-all active:scale-95"
              title="Copy Rendered HTML"
            >
              <Code className="w-4 h-4 opacity-80" />
            </button>

            {/* Print / PDF */}
            <button
              onClick={() => window.print()}
              style={{ borderColor: currentTheme.border }}
              className="p-1.5 rounded-lg border hover:bg-white/5 transition-all active:scale-95"
              title="Print or Export to PDF"
            >
              <Printer className="w-4 h-4 opacity-80" />
            </button>

            {/* Help Dialog Toggle */}
            <button
              onClick={() => setShowHelp(true)}
              style={{ borderColor: currentTheme.border }}
              className="p-1.5 rounded-lg border hover:bg-white/5 transition-all active:scale-95 text-blue-400"
              title="Keyboard Shortcuts Guide (F1)"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* ================= FORMATTING TOOLBAR ================= */}
      {!isFocusMode && (
        <div
          style={{
            backgroundColor: currentTheme.card,
            borderColor: currentTheme.border,
          }}
          className="h-10 border-b flex items-center justify-between px-4 z-10 shrink-0 text-xs shadow-sm"
        >
          {/* Quick Format Buttons */}
          <div className="flex items-center space-x-1 overflow-x-auto py-1">
            <button
              onClick={() => insertFormatting('# ', '', 'Heading 1')}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              title="Heading 1"
            >
              <Heading className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('**', '**', 'bold text')}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('*', '*', 'italic text')}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('~~', '~~', 'strikethrough')}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>

            <div style={{ backgroundColor: currentTheme.border }} className="h-4 w-[1px] mx-1.5" />

            <button
              onClick={() => insertFormatting('> ', '', 'Quote text')}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              title="Blockquote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('```javascript\n', '\n```\n', '// Code snippet')}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              title="Code Block"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('[', '](https://example.com)', 'Link text')}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              title="Insert Link (Ctrl+K)"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={insertTable}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              title="Insert Table"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('- [ ] ', '', 'Task item')}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              title="Checklist Item"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sync Scroll & Reset */}
          <div className="flex items-center space-x-3 text-xs">
            <label className="flex items-center space-x-1.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
              <input
                type="checkbox"
                checked={syncScroll}
                onChange={(e) => setSyncScroll(e.target.checked)}
                className="rounded border-gray-600 text-blue-600 focus:ring-0 w-3.5 h-3.5"
              />
              <span className="text-[11px] font-medium">Sync Scroll</span>
            </label>

            <button
              onClick={() => {
                if (confirm('Clear current document?')) {
                  setMarkdown('');
                  showToast('Document cleared');
                }
              }}
              className="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-red-500/10 transition-colors"
              title="Reset Content"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ================= MAIN SPLIT CONTENT AREA ================= */}
      <main
        ref={containerRef}
        className="flex-1 flex overflow-hidden relative"
      >
        {/* LEFT PANE: Raw Markdown Editor */}
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
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
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

        {/* RIGHT PANE: GitHub Visualized Markdown Preview */}
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

      {/* ================= FOOTER / STATUS BAR ================= */}
      <footer
        style={{
          backgroundColor: currentTheme.card,
          borderColor: currentTheme.border,
        }}
        className="h-7 border-t flex items-center justify-between px-4 text-[11px] select-none shrink-0 opacity-80"
      >
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5 font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>GFM Engine Ready</span>
          </span>
          <span>{stats.lines} lines</span>
          <span>{stats.words} words</span>
          <span>{stats.chars} characters</span>
          <span className="hidden sm:inline">⏱️ ~{stats.readingTime} min read</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="hidden md:inline text-[10px]">
            Saved {lastSaved.toLocaleTimeString()}
          </span>
          <span className="font-semibold">{currentTheme.name}</span>
        </div>
      </footer>

      {/* ================= TOAST NOTIFICATION ================= */}
      {toastMessage && (
        <div className="fixed bottom-10 right-6 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-slide-up border border-blue-400/30">
          <span className="text-base">{toastMessage.icon}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ================= KEYBOARD SHORTCUTS MODAL ================= */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div
            style={{
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
            }}
            className="w-full max-w-md rounded-2xl shadow-2xl border p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-base">
                <Keyboard className="w-5 h-5 text-blue-400" />
                <span>Keyboard Shortcuts</span>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 rounded-lg hover:bg-white/10 opacity-70 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: 'Ctrl + S / Cmd + S', desc: 'Download Markdown file' },
                { key: 'Ctrl + B / Cmd + B', desc: 'Toggle bold text' },
                { key: 'Ctrl + I / Cmd + I', desc: 'Toggle italic text' },
                { key: 'Ctrl + K / Cmd + K', desc: 'Insert URL link' },
                { key: 'Tab', desc: 'Insert 2 space indent' },
                { key: 'F1 / Shift + ?', desc: 'Toggle this Shortcuts Guide' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span className="opacity-80">{item.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-black/20 font-mono text-[11px] font-semibold border border-white/10">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
