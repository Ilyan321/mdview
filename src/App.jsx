import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import katex from 'katex';
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
  CheckCircle2,
  FileCheck,
  Link2,
  Unlink
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
  const [syncScroll, setSyncScroll] = useState(() => {
    return localStorage.getItem('mdview_sync_scroll') === 'true'; // Defaults to false (independent scrolling)
  });
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
  const editorViewRef = useRef(null);
  const previewRef = useRef(null);
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
      '.cm-selectionBackground, ::selection': {
        backgroundColor: currentTheme.mode === 'dark' ? 'rgba(56, 139, 253, 0.35) !important' : 'rgba(9, 105, 218, 0.2) !important',
      },
      '.cm-cursor': {
        borderLeftColor: currentTheme.accent,
        borderLeftWidth: '2px',
      },
    }, { dark: currentTheme.mode === 'dark' });
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
    if (editorViewRef.current) {
      const view = editorViewRef.current;
      const line = view.state.doc.line(Math.min(lineNumber, view.state.doc.lines));
      view.dispatch({
        selection: { anchor: line.from },
        scrollIntoView: true,
      });
      view.focus();
    }
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

  // --- Preprocess KaTeX Math Formulas ---
  const preprocessKaTeX = (md) => {
    // 1. Block math: $$ ... $$
    let result = md.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
      try {
        const html = katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false });
        return `<div class="katex-display my-4 overflow-x-auto py-2 text-center select-text">${html}</div>`;
      } catch (err) {
        return `<div class="p-2 text-xs font-mono text-red-400 bg-red-950/30 rounded border border-red-500/20">${err.message}</div>`;
      }
    });

    // 2. Inline math: $ ... $ (excluding currency like $100 or empty space)
    result = result.replace(/(^|[^\\])\$([^\$\n]+?)\$/g, (match, prefix, expr) => {
      if (/^\s*\d+([.,]\d+)?\s*$/.test(expr)) return match;
      try {
        const html = katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
        return `${prefix}<span class="katex-inline select-text">${html}</span>`;
      } catch {
        return match;
      }
    });

    return result;
  };

  // --- Initialize Mermaid Config ---
  useEffect(() => {
    if (typeof window !== 'undefined' && window.mermaid) {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: currentTheme.mode === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      });
    }
  }, [currentTheme]);

  // --- Markdown Parser with KaTeX, Mermaid & Highlight.js ---
  const parsedHtml = useMemo(() => {
    try {
      const withAlerts = preprocessGitHubAlerts(activeDoc?.content || '');
      const withMath = preprocessKaTeX(withAlerts);

      const renderer = new marked.Renderer();

      // Custom code block renderer with Window-Header & 1-Click Copy
      renderer.code = function({ text, lang }) {
        if (lang === 'mermaid') {
          return `<div class="mermaid-container my-4 p-4 rounded-lg border border-neutral-700/50 bg-black/25 flex justify-center overflow-x-auto"><pre class="mermaid select-text">${text}</pre></div>`;
        }

        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        let highlighted = '';
        try {
          highlighted = hljs.highlight(text, { language }).value;
        } catch {
          highlighted = hljs.highlightAuto(text).value;
        }

        const encoded = encodeURIComponent(text);
        return `
          <div class="studio-code-block my-4 rounded-lg border border-neutral-700/50 overflow-hidden bg-neutral-900/60 shadow-sm">
            <div class="code-header flex items-center justify-between px-3 py-1.5 bg-neutral-800/60 border-b border-neutral-700/40 text-[11px] font-mono select-none">
              <span class="text-blue-400 font-semibold uppercase tracking-wider">${language}</span>
              <button onclick="navigator.clipboard.writeText(decodeURIComponent('${encoded}')).then(() => { this.innerText = 'Copied!'; setTimeout(() => this.innerText = 'Copy', 1500); })" class="px-2 py-0.5 rounded hover:bg-white/10 text-neutral-300 text-[10px] transition-colors border border-white/10">Copy</button>
            </div>
            <pre class="p-3 overflow-x-auto text-[13px] leading-relaxed font-mono"><code class="hljs language-${language}">${highlighted}</code></pre>
          </div>
        `;
      };

      marked.setOptions({
        gfm: true,
        breaks: true,
        renderer,
      });

      const rawHtml = marked.parse(withMath);
      return DOMPurify.sanitize(rawHtml, {
        ADD_ATTR: ['target', 'data-task-index', 'onclick'],
        ADD_TAGS: ['svg', 'g', 'path', 'text', 'line', 'rect', 'circle', 'polygon', 'defs', 'marker'],
      });
    } catch (e) {
      return `<div class="p-4 text-red-400 bg-red-950/40 rounded border border-red-500/20">Render Error: ${e.message}</div>`;
    }
  }, [activeDoc?.content]);

  // --- Run Mermaid Diagrams after Render ---
  useEffect(() => {
    if (previewRef.current && typeof window !== 'undefined' && window.mermaid) {
      const nodes = previewRef.current.querySelectorAll('.mermaid');
      if (nodes.length > 0) {
        window.mermaid.run({ nodes }).catch((err) => {
          console.warn('Mermaid diagram render notice:', err);
        });
      }
    }
  }, [parsedHtml, currentTheme]);

  // --- Statistics ---
  const stats = useMemo(() => {
    const text = (activeDoc?.content || '').trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const lines = (activeDoc?.content || '').split('\n').length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, lines, readingTime };
  }, [activeDoc?.content]);

  // --- Formatting Helpers ---
  const insertFormatting = (prefix, suffix = '', defaultPlaceholder = 'text') => {
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
  };

  const insertTable = () => {
    const tableTemplate = `\n| Column 1 | Column 2 | Column 3 |\n| :--- | :---: | ---: |\n| Item Alpha | Active | $120.00 |\n| Item Beta | Inactive | $45.00 |\n\n`;
    insertFormatting('', '', tableTemplate);
  };

  // --- Synchronized Scrolling ---
  const handleScrollUpdate = useCallback((view) => {
    if (!syncScroll || !previewRef.current) return;
    const scroller = view.scrollDOM;
    const preview = previewRef.current;
    const scrollPercentage = scroller.scrollTop / (scroller.scrollHeight - scroller.clientHeight || 1);
    preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
  }, [syncScroll]);

  const toggleSyncScroll = () => {
    setSyncScroll((prev) => {
      const next = !prev;
      localStorage.setItem('mdview_sync_scroll', String(next));
      showToast(next ? 'Synchronized scrolling enabled' : 'Independent scrolling enabled');
      return next;
    });
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

  // --- Export Actions ---
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

  const handleDownloadStandaloneHtml = () => {
    const isDark = currentTheme.mode === 'dark';
    const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activeDoc.title.replace(/\.md$/, '')}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown.min.css">
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

            {/* Independent / Sync Scroll Toggle */}
            <div className="flex items-center space-x-2 text-[11px]">
              <button
                type="button"
                onClick={toggleSyncScroll}
                className={`flex items-center space-x-1.5 px-2 py-0.5 rounded border transition-all ${
                  syncScroll
                    ? 'bg-blue-600/20 border-blue-500/40 text-blue-400 font-medium'
                    : 'border-white/10 text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
                title={
                  syncScroll
                    ? 'Scroll sync enabled (panes scroll together). Click for independent scrolling.'
                    : 'Independent scroll active (panes scroll separately). Click to enable sync.'
                }
              >
                {syncScroll ? (
                  <Link2 className="w-3 h-3 text-blue-400" />
                ) : (
                  <Unlink className="w-3 h-3 opacity-60" />
                )}
                <span className="text-[10px] tracking-tight">
                  {syncScroll ? 'Sync On' : 'Independent'}
                </span>
              </button>
            </div>
          </div>

          {/* MAIN SPLIT CONTENT AREA */}
          <main
            ref={containerRef}
            className="flex-1 flex overflow-hidden relative"
          >
            {/* LEFT PANE: CodeMirror 6 Editor */}
            {(viewMode === 'split' || viewMode === 'editor') && (
              <div
                style={{
                  width: viewMode === 'split' ? `${splitRatio}%` : '100%',
                }}
                className="h-full flex flex-col relative overflow-hidden bg-transparent"
              >
                <CodeMirror
                  value={activeDoc.content}
                  height="100%"
                  className="h-full flex-1 overflow-auto"
                  extensions={[
                    markdown(),
                    EditorView.lineWrapping,
                    cmCustomTheme,
                    EditorView.updateListener.of((update) => {
                      if (update.view) {
                        editorViewRef.current = update.view;
                      }
                      if (update.selectionSet) {
                        const pos = update.state.selection.main.head;
                        const line = update.state.doc.lineAt(pos);
                        setCursorPos({
                          line: line.number,
                          col: pos - line.from + 1,
                        });
                      }
                      if (update.docChanged) {
                        updateActiveContent(update.state.doc.toString());
                      }
                      handleScrollUpdate(update.view);
                    }),
                  ]}
                  onCreateEditor={(view) => {
                    editorViewRef.current = view;
                  }}
                  basicSetup={{
                    lineNumbers: true,
                    highlightActiveLineGutter: true,
                    highlightActiveLine: true,
                    foldGutter: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    autocompletion: true,
                    indentOnInput: true,
                  }}
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
          <span className="text-[10px] px-1 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            CodeMirror 6
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
                { key: 'Tab', desc: 'CodeMirror 2-space soft indent' },
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
