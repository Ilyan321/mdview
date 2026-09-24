import React from 'react';

export default function MarkdownPreview({
  parsedHtml,
  previewRef,
  currentTheme,
  viewMode,
  splitRatio,
}) {
  if (viewMode !== 'split' && viewMode !== 'preview') return null;

  return (
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
  );
}
