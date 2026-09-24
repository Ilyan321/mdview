# 📄 Product Requirements Document (PRD)

## Project Name: `mdview` — Modern Developer Markdown Studio
**Version:** 1.0.0-PROD  
**Author:** @Ilyan321  
**Status:** Approved & Active Implementation  
**Target Delivery:** September 2026  

---

## 1. Executive Summary & Vision Statement

### 1.1 Problem Statement
Existing markdown tools fall into two unsatisfactory categories:
1. **Generic Web Clones:** Plagued by low-contrast AI-slop aesthetics (oversaturated purple gradients, illegible glassmorphism cards, floaty animations) with sluggish text rendering and uninspired developer ergonomics.
2. **Heavy Desktop Suites:** Sluggish multi-hundred-megabyte Electron apps that consume excessive RAM, lack instant web availability, or lock users into proprietary cloud sync formats.

### 1.2 Vision Statement
`mdview` is a high-craft, zero-slop **Developer Markdown Studio** built on the design ethos of **VS Code and GitHub Next**. It delivers a high-density, high-performance web writing environment with live GitHub Flavored Markdown (GFM) visualization, real-time Mermaid diagrams, KaTeX mathematical typesetting, and zero-compromise developer ergonomics.

---

## 2. Target Audience & User Personas

| Persona | Role | Primary Needs |
| :--- | :--- | :--- |
| **Alex (Senior Engineer)** | Backend & Systems Architect | Writing system RFCs, architecture specs with sequence/flowchart Mermaid diagrams, and code snippets. Demands zero typing latency. |
| **Maya (Open Source Maintainer)**| OSS Lead | Crafting pixel-perfect GitHub READMEs, release notes, and documentation with authentic GitHub callout alerts and badges. |
| **Kenji (Researcher / Student)** | CS Student & AI Researcher | Writing mathematical formulas using LaTeX/KaTeX, exporting clean offline PDFs, and privacy-first local document storage. |

---

## 3. Product Architecture & Technical Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        mdview Studio Architecture                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [ Client Browser ]                                                   │
│          │                                                             │
│          ▼                                                             │
│   ┌───────────────┐     Debounced Sync      ┌──────────────────────┐   │
│   │ CodeMirror 6  │ ──────────────────────> │ GFM Pipeline Engine  │   │
│   │ Input Engine  │  (< 8ms latency loop)   │ • Marked GFM         │   │
│   └───────────────┘                         │ • DOMPurify sanitize │   │
│          │                                  │ • Highlight.js       │   │
│          ▼                                  │ • Mermaid.js parser  │   │
│   ┌───────────────┐                         │ • KaTeX math renderer│   │
│   │ LocalStorage  │                         └──────────────────────┘   │
│   │ Multi-Doc DB  │                                    │               │
│   └───────────────┘                                    ▼               │
│                                             ┌──────────────────────┐   │
│                                             │ GitHub Next Viewport │   │
│                                             │ (Synchronized Scroll)│   │
│                                             └──────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

* **Frontend Framework:** React 19 + Vite (Modern ESM bundler, <400ms HMR)
* **Editor Core Engine:** CodeMirror 6 (Virtual scrolling, syntax highlighting, bracket matching, line numbers)
* **Rendering Engine:** Marked (GFM standard) + DOMPurify (XSS prevention)
* **Code Highlighting:** Highlight.js 11 (TrueColor developer themes)
* **Diagramming Engine:** Mermaid.js 10 (Interactive flowcharts, state charts, sequence diagrams)
* **Mathematical Typesetting:** KaTeX 0.16 (Fast LaTeX rendering)
* **Styling & Tokens:** Tailwind CSS + custom studio tokens (`#0d1117`, `#1f1f1f`)

---

## 4. Functional Requirements Matrix

### 4.1 Studio Workspace Shell
* **FR-1.1 Collapsible Sidebar:** Left collapsible explorer panel containing:
  * Open Document Explorer (create, rename, delete, switch files).
  * Document Heading Outline (live table of contents tree with click-to-jump).
* **FR-1.2 Tab Manager:** Top editor tab bar supporting multiple open documents, active indicator, unsaved modification badge, close tab, and new tab (`+`).
* **FR-1.3 Telemetry Status Bar:** Bottom status line displaying:
  * Encoding (`UTF-8`), Indentation (`Spaces: 2`), Cursor position (`Ln X, Col Y`), Word count, Character count, Reading time estimation, and GFM status.

### 4.2 Editor Engine (CodeMirror 6)
* **FR-2.1 Typing Performance:** Sub-16ms keystroke-to-render loop for 50,000+ line documents.
* **FR-2.2 Syntax Highlighting:** Real-time token highlighting for markdown symbols, bold, italic, code spans, links, and code fences.
* **FR-2.3 Ergonomics:** Line numbers gutter, active line highlighting, bracket/quote auto-closing, tab indent/outdent.

### 4.3 Visualizer & Rendering Engine
* **FR-3.1 GitHub Flavored Markdown (GFM):** Tables with alignment, strikethrough, autolinks, and task checklists.
* **FR-3.2 GitHub Admonitions / Callouts:** Full support for `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`.
* **FR-3.3 Live Mermaid Diagrams:** Automatic rendering of ```mermaid blocks into interactive SVG diagrams.
* **FR-3.4 LaTeX / KaTeX Formulas:** Inline `$math$` and block `$$math$$` expressions rendered cleanly.
* **FR-3.5 Studio Code Blocks:** Window-header code blocks featuring language badges, line numbers, and 1-click clipboard copy.

### 4.4 Data Persistence & Export Suite
* **FR-4.1 Zero-Cloud Privacy:** All document state is persisted in client-side `localStorage`. Zero telemetry, zero analytics tracking, 100% offline-ready.
* **FR-4.2 Export Formats:**
  * Raw Markdown (`.md`)
  * Standalone Self-Contained HTML (inlines all CSS for offline viewing without servers)
  * Print-Optimized PDF (custom `@media print` rules removing UI controls)
  * Clean Rendered HTML to clipboard

---

## 5. Non-Functional Requirements (NFR)

* **NFR-1 Performance:** First Contentful Paint (FCP) < 400ms on broadband; Keystroke latency < 12ms.
* **NFR-2 Reliability:** Zero state loss on accidental page refresh or browser restart (automatic local caching).
* **NFR-3 Security:** Strict DOMPurify sanitization stripping executable scripts and `javascript:` URI vectors.
* **NFR-4 Accessibility:** WCAG 2.1 AAA contrast ratio (> 7:1) across all text, borders, and functional controls.

---

## 6. Design System & Theme Specifications

### 6.1 Studio Color Tokens
1. **GitHub Dark Default (Primary Studio):**
   * Background: `#0d1117` | Panels: `#161b22` | Borders: `#30363d` | Accent: `#2f81f7` | Text: `#e6edf3`
2. **GitHub Dark High-Contrast:**
   * Background: `#010409` | Panels: `#0d1117` | Borders: `#444c56` | Accent: `#4493f8` | Text: `#ffffff`
3. **VS Code Dark Modern:**
   * Background: `#181818` | Panels: `#1f1f1f` | Borders: `#2b2b2b` | Accent: `#0078d4` | Text: `#cccccc`
4. **GitHub Light High-Contrast:**
   * Background: `#ffffff` | Panels: `#f6f8fa` | Borders: `#d0d7de` | Accent: `#0969da` | Text: `#1f2328`

### 6.2 Typography Hierarchy
* **Prose & Document Display:** `Inter`, `Geist`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
* **Editor, Code Blocks & Telemetry:** `JetBrains Mono`, `Fira Code`, `Menlo`, `monospace`

---

## 7. Milestone Roadmap & Release Criteria

- [x] **Milestone 1:** PRD Specification & Clean Repository Foundation
- [ ] **Milestone 2:** VS Code Studio Shell, Collapsible Sidebar & Tab Manager
- [ ] **Milestone 3:** CodeMirror 6 Editor Core Integration
- [ ] **Milestone 4:** GitHub Next Visualizer Engine (Mermaid + KaTeX)
- [ ] **Milestone 5:** Studio Theme Engine & Export Suite
- [ ] **Milestone 6:** CI/CD GitHub Pages Automation & Portfolio Documentation
