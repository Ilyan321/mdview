import { useMemo, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import katex from 'katex';
import hljs from '../utils/highlightConfig';

// --- Preprocess GitHub Callout Alerts ---
export function preprocessGitHubAlerts(md) {
  if (!md) return '';
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
}

// --- Preprocess KaTeX Math Formulas ---
export function preprocessKaTeX(md) {
  if (!md) return '';
  // 1. Block math: $$ ... $$
  let result = md.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
    try {
      const html = katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false });
      return `<div class="katex-display my-4 overflow-x-auto py-2 text-center select-text">${html}</div>`;
    } catch (err) {
      return `<div class="p-2 text-xs font-mono text-red-400 bg-red-950/30 rounded border border-red-500/20">${err.message}</div>`;
    }
  });

  // 2. Inline math: $ ... $ (excluding whitespace-padded delimiters and standalone currency)
  result = result.replace(/(^|[^\\])\$(?!\s)([^\$\n]+?)(?<!\s)\$(?!\d)/g, (match, prefix, expr) => {
    if (/^\s*\d+([.,]\d+)?\s*$/.test(expr)) return match;
    try {
      const html = katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
      return `${prefix}<span class="katex-inline select-text">${html}</span>`;
    } catch {
      return match;
    }
  });

  return result;
}

// --- Extract Outline / Table of Contents ---
export function extractOutline(markdownContent) {
  const lines = (markdownContent || '').split('\n');
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
}

// --- Compile Markdown to Sanitized HTML ---
export function compileMarkdown(markdownContent) {
  try {
    const withAlerts = preprocessGitHubAlerts(markdownContent || '');
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
}

export function useMarkdownPipeline(markdownContent, currentTheme, previewRef) {
  // Initialize Mermaid Config on theme switch
  useEffect(() => {
    if (typeof window !== 'undefined' && window.mermaid) {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: currentTheme?.mode === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      });
    }
  }, [currentTheme]);

  // Live Outline Extraction (Table of Contents)
  const outline = useMemo(() => extractOutline(markdownContent), [markdownContent]);

  // Markdown Compilation with KaTeX, Mermaid & Highlight.js
  const parsedHtml = useMemo(() => compileMarkdown(markdownContent), [markdownContent]);

  // Run Mermaid Diagrams after Render
  useEffect(() => {
    if (previewRef?.current && typeof window !== 'undefined' && window.mermaid) {
      const nodes = previewRef.current.querySelectorAll('.mermaid');
      if (nodes.length > 0) {
        window.mermaid.run({ nodes }).catch((err) => {
          console.warn('Mermaid diagram render notice:', err);
        });
      }
    }
  }, [parsedHtml, currentTheme, previewRef]);

  return {
    parsedHtml,
    outline,
  };
}
