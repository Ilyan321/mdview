import fs from 'fs';
import { execSync } from 'child_process';

const bannerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 630px;
    background: #0d1117;
    color: #e6edf3;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 44px 56px;
    justify-content: space-between;
  }

  /* Ambient background glows */
  .glow-1 {
    position: absolute;
    top: -120px;
    right: -80px;
    width: 550px;
    height: 550px;
    background: radial-gradient(circle, rgba(56, 139, 253, 0.16) 0%, rgba(13, 17, 23, 0) 70%);
    pointer-events: none;
  }
  .glow-2 {
    position: absolute;
    bottom: -100px;
    left: 200px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(163, 113, 247, 0.12) 0%, rgba(13, 17, 23, 0) 70%);
    pointer-events: none;
  }

  /* Header Branding */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
  }
  .logo-group {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .logo-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #1f6feb 0%, #388bfd 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 24px rgba(56, 139, 253, 0.4);
    border: 1px solid rgba(88, 166, 255, 0.4);
  }
  .logo-icon svg {
    width: 28px;
    height: 28px;
    fill: #ffffff;
  }
  .logo-text {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.8px;
    color: #ffffff;
  }
  .logo-sub {
    font-size: 14px;
    font-weight: 500;
    color: #8b949e;
    margin-top: 2px;
  }
  .badge-pwa {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(56, 139, 253, 0.1);
    border: 1px solid rgba(88, 166, 255, 0.3);
    padding: 8px 18px;
    border-radius: 9999px;
    color: #58a6ff;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-family: 'JetBrains Mono', Menlo, monospace;
  }
  .badge-dot {
    width: 8px;
    height: 8px;
    background: #3fb950;
    border-radius: 50%;
    box-shadow: 0 0 8px #3fb950;
  }

  /* Hero Headline */
  .hero-text {
    z-index: 10;
    margin-top: 6px;
  }
  .headline {
    font-size: 40px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -1px;
    background: linear-gradient(180deg, #ffffff 0%, #c9d1d9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .subheadline {
    font-size: 17px;
    color: #8b949e;
    margin-top: 6px;
    font-weight: 400;
  }

  /* IDE Mockup Shell */
  .ide-window {
    z-index: 10;
    height: 255px;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.05);
  }
  .ide-header {
    height: 38px;
    background: #0d1117;
    border-bottom: 1px solid #30363d;
    display: flex;
    align-items: center;
    padding: 0 14px;
    justify-content: space-between;
  }
  .window-controls {
    display: flex;
    gap: 8px;
  }
  .wc-dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
  }
  .wc-red { background: #ff5f56; }
  .wc-yellow { background: #ffbd2e; }
  .wc-green { background: #27c93f; }
  .ide-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .ide-tab {
    background: #161b22;
    border-top: 2px solid #58a6ff;
    padding: 6px 16px;
    font-size: 12px;
    color: #e6edf3;
    font-family: 'JetBrains Mono', Menlo, monospace;
    font-weight: 500;
    border-left: 1px solid #30363d;
    border-right: 1px solid #30363d;
  }
  .ide-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  .ide-editor {
    flex: 1;
    border-right: 1px solid #30363d;
    padding: 12px 18px;
    font-family: 'JetBrains Mono', Menlo, Consolas, monospace;
    font-size: 12.5px;
    line-height: 1.6;
    background: #0d1117;
    color: #c9d1d9;
  }
  .code-h1 { color: #58a6ff; font-weight: bold; }
  .code-fence { color: #8b949e; }
  .code-math { color: #d2a8ff; }
  .code-num { color: #484f58; margin-right: 14px; user-select: none; }
  
  .ide-preview {
    flex: 1;
    padding: 14px 20px;
    background: #161b22;
    color: #e6edf3;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 12.5px;
  }
  .preview-diagram {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 8px;
    padding: 8px 14px;
  }
  .diag-node {
    background: #21262d;
    border: 1px solid #58a6ff;
    color: #58a6ff;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    font-family: 'JetBrains Mono', Menlo, monospace;
  }
  .diag-arrow {
    color: #8b949e;
    font-size: 12px;
    font-weight: bold;
  }
  .preview-math {
    background: rgba(163, 113, 247, 0.08);
    border-left: 3px solid #a371f7;
    padding: 6px 12px;
    border-radius: 0 6px 6px 0;
    font-style: italic;
    color: #d2a8ff;
    font-size: 12.5px;
  }
  .preview-alert {
    background: rgba(56, 139, 253, 0.08);
    border-left: 3px solid #388bfd;
    padding: 6px 12px;
    border-radius: 0 6px 6px 0;
    font-size: 11.5px;
    color: #8b949e;
  }

  /* Footer Badges */
  .footer-row {
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;
    font-size: 13px;
    color: #8b949e;
  }
  .feature-pills {
    display: flex;
    gap: 10px;
  }
  .pill {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid #30363d;
    padding: 5px 12px;
    border-radius: 6px;
    color: #c9d1d9;
    font-size: 12px;
    font-family: 'JetBrains Mono', Menlo, monospace;
  }
  .repo-tag {
    color: #58a6ff;
    font-family: 'JetBrains Mono', Menlo, monospace;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
</style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>

  <!-- Header -->
  <div class="header">
    <div class="logo-group">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
      </div>
      <div>
        <div class="logo-text">mdview</div>
        <div class="logo-sub">Modern GitHub Markdown Studio</div>
      </div>
    </div>
    <div class="badge-pwa">
      <div class="badge-dot"></div>
      <span>100% Offline PWA Ready</span>
    </div>
  </div>

  <!-- Hero Text -->
  <div class="hero-text">
    <div class="headline">High-Performance GitHub Markdown & Diagrams</div>
    <div class="subheadline">Zero tracking telemetry, instant KaTeX math, dynamic Mermaid rendering, and client-side data sovereignty.</div>
  </div>

  <!-- IDE Mockup -->
  <div class="ide-window">
    <div class="ide-header">
      <div class="window-controls">
        <div class="wc-dot wc-red"></div>
        <div class="wc-dot wc-yellow"></div>
        <div class="wc-dot wc-green"></div>
      </div>
      <div class="ide-tabs">
        <div class="ide-tab">⚡ studio_showcase.md</div>
      </div>
      <div style="width: 48px;"></div>
    </div>
    <div class="ide-body">
      <div class="ide-editor">
        <div><span class="code-num">1</span><span class="code-h1"># ⚡ Architecture Overview</span></div>
        <div><span class="code-num">2</span><span class="code-fence">\`\`\`mermaid</span></div>
        <div><span class="code-num">3</span><span>graph LR</span></div>
        <div><span class="code-num">4</span><span>  Client[Client PWA] --&gt; Engine[KaTeX + Mermaid]</span></div>
        <div><span class="code-num">5</span><span class="code-fence">\`\`\`</span></div>
        <div><span class="code-num">6</span><span class="code-math">$$e^{i\\pi} + 1 = 0 \\quad \\text{and} \\quad E = mc^2$$</span></div>
        <div><span class="code-num">7</span><span>&gt; [!TIP] Zero external tracking or telemetry</span></div>
      </div>
      <div class="ide-preview">
        <div class="preview-diagram">
          <div class="diag-node">Client PWA</div>
          <div class="diag-arrow">──►</div>
          <div class="diag-node">KaTeX + Mermaid</div>
          <div class="diag-arrow">──►</div>
          <div class="diag-node">DOM SVG</div>
        </div>
        <div class="preview-math">
          e^{iπ} + 1 = 0 &nbsp; • &nbsp; E = mc² &nbsp; (KaTeX Math Engine)
        </div>
        <div class="preview-alert">
          <strong style="color:#58a6ff;">TIP:</strong> 100% local browser vault. Documents never leave your device.
        </div>
      </div>
    </div>
  </div>

  <!-- Footer Pills -->
  <div class="footer-row">
    <div class="feature-pills">
      <span class="pill">CodeMirror 6</span>
      <span class="pill">Mermaid.js v10</span>
      <span class="pill">KaTeX LaTeX</span>
      <span class="pill">Vite 8 + React 19</span>
      <span class="pill">Tailwind CSS</span>
    </div>
    <div class="repo-tag">
      <span>github.com/Ilyan321/mdview</span>
    </div>
  </div>
</body>
</html>`;

const tempHtmlPath = '/tmp/og-banner.html';
fs.writeFileSync(tempHtmlPath, bannerHtml);

console.log('Rendering 1200x630 social preview banner via Chrome headless...');
execSync(
  'google-chrome --headless=new --no-sandbox --window-size=1200,630 --screenshot=public/og-preview.png --hide-scrollbars file://' +
    tempHtmlPath
);

const stats = fs.statSync('public/og-preview.png');
console.log('Successfully generated public/og-preview.png (' + stats.size + ' bytes)');
