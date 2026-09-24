export const TEMPLATES = {
  readme: {
    name: 'GitHub README',
    description: 'Modern open source project README with badges, tables & code',
    content: `# ⚡ Awesome Project

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()

> A modern, lightning-fast application designed for developers who love clean architecture and delightful developer experience.

---

## 📑 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [Configuration](#-configuration)
- [Contributing](#-contributing)

---

## ✨ Features

- 🌓 **Dual Mode Split View** — Live editing and GitHub Flavored Markdown visualizer
- 🎨 **GitHub Themes** — Dark & Light mode toggle with pixel-perfect styles
- ⚡ **Zero-Lag Typing** — Instant reactive preview rendering
- 📋 **One-Click Export** — Download as \`.md\`, copy clean HTML, or print to PDF
- 📦 **Offline Capable** — Auto-saves directly to browser storage

---

## 🚀 Quick Start

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/example/awesome-project.git

# Navigate and install dependencies
cd awesome-project
npm install

# Start the dev server
npm run dev
\`\`\`

### Example Code

Here is how you initialize the client in TypeScript:

\`\`\`typescript
import { createClient } from '@awesome/core';

const client = createClient({
  apiKey: process.env.API_KEY,
  endpoint: 'https://api.awesome.dev/v1',
  timeoutMs: 5000,
});

async function main() {
  const result = await client.visualize({
    mode: 'split',
    theme: 'github-dark'
  });
  console.log('✨ Initialized successfully:', result);
}

main();
\`\`\`

---

## 📊 Feature Comparison

| Feature | mdview Web | Notion | Standard Textarea |
| :--- | :---: | :---: | :---: |
| **GitHub Flavored Markdown** | ✅ Full | ⚠️ Partial | ❌ None |
| **Draggable Split Pane** | ✅ Yes | ❌ No | ❌ No |
| **One-Click Code Copy** | ✅ Yes | ⚠️ Limited | ❌ No |
| **100% Client-Side Privacy** | 🔒 Private | ☁️ Cloud | 🔒 Private |

---

## 💡 Pro Tips & Callouts

> [!NOTE]
> All changes are automatically preserved in your browser's local storage so you'll never lose your draft.

> [!TIP]
> Use **Ctrl + S** (or **Cmd + S**) to immediately download your markdown file.

> [!WARNING]
> Clearing your browser cache will reset unsaved local documents.

---

## 📋 Roadmap & Tasks

- [x] Initial MVP release
- [x] GitHub Dark and Light themes
- [x] Interactive task lists
- [ ] Export to Word (.docx)
- [ ] Cloud synchronization

---

## 📄 License

MIT © 2026 [Developer](https://github.com)
`
  },
  showcase: {
    name: 'Markdown Showcase',
    description: 'Comprehensive test of headings, tables, blockquotes, and formatting',
    content: `# 🎨 Comprehensive Markdown Showcase

This document demonstrates every single GitHub Markdown element rendered with high precision.

---

## Headings Hierarchy

# Heading Level 1
## Heading Level 2
### Heading Level 3
#### Heading Level 4
##### Heading Level 5

---

## Text Styling & Emphasis

* Single asterisks for *italic text*
* Double asterisks for **bold text**
* Triple asterisks for ***bold and italic***
* Tildes for ~~strikethrough text~~
* Subscript: H~2~O and Superscript: X^2^
* Inline \`code snippets\` with syntax styling
* Keyboard keys: <kbd>Ctrl</kbd> + <kbd>K</kbd>

---

## GitHub Admonitions / Alerts

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs user immediate attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

---

## Lists & Nested Structures

### Ordered List
1. Step One: Plan architecture
2. Step Two: Implement MVP
   1. Setup Vite project
   2. Write React components
3. Step Three: Deploy & profit

### Interactive Tasks
- [x] Completed task item
- [ ] Click this checkbox directly in the preview to toggle it!
- [ ] Another pending milestone

---

## Tables with Alignments

| Left Aligned | Centered Column | Right Aligned (Price) |
| :--- | :---: | ---: |
| Item A | In Stock | $29.99 |
| Item B | Low Stock | $149.00 |
| Item C | Out of Stock | $4.50 |

---

## Code Blocks in Multiple Languages

\`\`\`python
# Python list comprehension & data processing
def calculate_metrics(values: list[float]) -> dict:
    return {
        "mean": sum(values) / len(values),
        "max": max(values),
        "min": min(values)
    }

print(calculate_metrics([12.5, 45.0, 78.2, 99.1]))
\`\`\`

\`\`\`json
{
  "project": "mdview-web",
  "version": "1.0.0",
  "theme": "github-dark",
  "liveSync": true
}
\`\`\`
`
  },
  spec: {
    name: 'Technical Architecture Spec',
    description: 'Engineering design doc with SLAs, endpoints, and data schemas',
    content: `# 🏗️ Architecture Design Document: Real-Time Markdown Engine

**Author:** Engineering Team  
**Status:** In Review  
**Target Date:** Q4 2026  

---

## 1. Objective
Design a zero-latency clientside markdown parser and visualizer that renders GitHub Flavored Markdown (GFM) with synchronous scrolling and reactive state updates.

---

## 2. System Architecture & Component Flow

\`\`\`mermaid
flowchart TD
    A[CodeMirror 6 Engine] -->|Debounced Stream < 8ms| B[Marked GFM Parser]
    B --> C{Syntax Tokenizer}
    C -->|Code Blocks| D[Highlight.js Engine]
    C -->|LaTeX Math| E[KaTeX Math Engine]
    C -->|Mermaid Specs| F[Mermaid SVG Engine]
    D --> G[DOMPurify Sanitizer]
    E --> G
    F --> G
    G --> H[GitHub Next Viewport]
\`\`\`

---

## 3. Mathematical Typesetting Benchmark

The latency model satisfies:

$$T(n) = \\mathcal{O}(n \\log n) + \\int_{0}^{t} \\lambda(s) ds$$

Where inline speed guarantees: $E = mc^2$ and $\\Delta t < 16\\text{ms}$.

---

## 4. Performance Benchmarks

| Metric | Target | Current | Status |
| :--- | :---: | :---: | :---: |
| **First Contentful Paint (FCP)** | < 300ms | 180ms | 🟢 Pass |
| **Keystroke Render Latency** | < 16ms | 4ms | 🟢 Pass |
| **Max Document Size** | > 100,000 words | 250,000 words | 🟢 Pass |

---

## 4. API Specification

\`\`\`http
POST /api/v1/documents/export
Content-Type: application/json

{
  "format": "pdf",
  "theme": "github-dark",
  "content": "# Markdown payload..."
}
\`\`\`

---

## 5. Security & Sanitization
* All rendered HTML is strictly sanitized using DOMPurify with default safe tags.
* Script tags and inline \`javascript:\` URIs are stripped before mounting into the document tree.
`
  }
};
