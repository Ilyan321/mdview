import { describe, it, expect } from 'vitest';
import {
  preprocessGitHubAlerts,
  preprocessKaTeX,
  extractOutline,
  compileMarkdown,
} from '../src/hooks/useMarkdownPipeline';

describe('Markdown Pipeline: GitHub Alerts Preprocessor', () => {
  it('returns empty string for null or empty input', () => {
    expect(preprocessGitHubAlerts('')).toBe('');
    expect(preprocessGitHubAlerts(null)).toBe('');
  });

  it('transforms [!NOTE] alert callouts into gh-alert-note containers', () => {
    const input = '> [!NOTE]\n> This is a critical architectural note.';
    const output = preprocessGitHubAlerts(input);
    expect(output).toContain('gh-alert gh-alert-note');
    expect(output).toContain('<span>Note</span>');
    expect(output).toContain('This is a critical architectural note.');
    expect(output).not.toContain('> This is a critical architectural note.');
  });

  it('transforms all standard GitHub alert types (TIP, IMPORTANT, WARNING, CAUTION)', () => {
    const alertTypes = [
      { type: 'TIP', class: 'gh-alert-tip', title: 'Tip' },
      { type: 'IMPORTANT', class: 'gh-alert-important', title: 'Important' },
      { type: 'WARNING', class: 'gh-alert-warning', title: 'Warning' },
      { type: 'CAUTION', class: 'gh-alert-caution', title: 'Caution' },
    ];

    for (const { type, class: className, title } of alertTypes) {
      const input = `> [!${type}]\n> Sample content for ${type}`;
      const output = preprocessGitHubAlerts(input);
      expect(output).toContain(className);
      expect(output).toContain(`<span>${title}</span>`);
      expect(output).toContain(`Sample content for ${type}`);
    }
  });

  it('leaves standard non-alert blockquotes unmutated', () => {
    const input = '> Just a standard quote without an alert token\n> Continues here';
    const output = preprocessGitHubAlerts(input);
    expect(output).toBe(input);
  });
});

describe('Markdown Pipeline: KaTeX Math Preprocessor', () => {
  it('returns empty string for empty input', () => {
    expect(preprocessKaTeX('')).toBe('');
    expect(preprocessKaTeX(null)).toBe('');
  });

  it('transforms display block math $$...$$ into katex-display containers', () => {
    const input = 'Here is Gauss theorem: $$ \\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0} $$ in electrodynamics.';
    const output = preprocessKaTeX(input);
    expect(output).toContain('class="katex-display');
    expect(output).toContain('class="katex"');
  });

  it('transforms inline math $...$ into katex-inline spans', () => {
    const input = 'Einstein formulated $E = mc^2$ in 1905.';
    const output = preprocessKaTeX(input);
    expect(output).toContain('class="katex-inline');
    expect(output).toContain('class="katex"');
  });

  it('protects currency values from being parsed as math expressions', () => {
    const input = 'This server costs $100 per month or $49.99 for annual discount.';
    const output = preprocessKaTeX(input);
    expect(output).toBe(input);
    expect(output).not.toContain('katex-inline');
  });

  it('gracefully handles malformed LaTeX expressions without throwing', () => {
    const malformed = '$$\\invalidcommand{incomplete$$';
    expect(() => preprocessKaTeX(malformed)).not.toThrow();
  });
});

describe('Markdown Pipeline: Table of Contents & Outline Extractor', () => {
  it('extracts hierarchical headings with correct levels and 1-indexed line numbers', () => {
    const markdown = [
      '# Document Title',
      'Introductory paragraph',
      '## Architecture Overview',
      'Content text',
      '### Sub-system A',
      '### Sub-system B',
      '## Deployment',
    ].join('\n');

    const outline = extractOutline(markdown);
    expect(outline).toHaveLength(5);
    expect(outline[0]).toEqual({ level: 1, text: 'Document Title', lineNumber: 1 });
    expect(outline[1]).toEqual({ level: 2, text: 'Architecture Overview', lineNumber: 3 });
    expect(outline[2]).toEqual({ level: 3, text: 'Sub-system A', lineNumber: 5 });
    expect(outline[3]).toEqual({ level: 3, text: 'Sub-system B', lineNumber: 6 });
    expect(outline[4]).toEqual({ level: 2, text: 'Deployment', lineNumber: 7 });
  });

  it('handles documents with no headings cleanly', () => {
    const markdown = 'Just plain paragraphs\nwithout any markdown header syntax.';
    const outline = extractOutline(markdown);
    expect(outline).toEqual([]);
  });
});

describe('Markdown Pipeline: Markdown Compilation & Code Blocks', () => {
  it('wraps mermaid code blocks in .mermaid-container with .mermaid pre elements', () => {
    const markdown = '```mermaid\ngraph TD\n  A --> B\n```';
    const html = compileMarkdown(markdown);
    expect(html).toContain('class="mermaid-container');
    expect(html).toContain('class="mermaid select-text"');
    expect(html).toContain('graph TD');
  });

  it('renders standard code blocks with language badge and copy action button', () => {
    const markdown = '```javascript\nconst studio = "mdview";\nconsole.log(studio);\n```';
    const html = compileMarkdown(markdown);
    expect(html).toContain('class="studio-code-block');
    expect(html).toContain('javascript');
    expect(html).toContain('Copy');
    expect(html).toContain('hljs language-javascript');
  });

  it('sanitizes malicious script tags and XSS payloads via DOMPurify', () => {
    const malicious = '<script>alert("hacked")</script><img src="x" onerror="alert(1)" />Normal text';
    const html = compileMarkdown(malicious);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('onerror=');
    expect(html).toContain('Normal text');
  });
});
