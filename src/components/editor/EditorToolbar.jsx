import React from 'react';
import {
  Heading,
  Bold,
  Italic,
  Strikethrough,
  Quote,
  Code,
  Link as LinkIcon,
  Table as TableIcon,
  CheckSquare,
  Link2,
  Unlink,
} from 'lucide-react';

export default function EditorToolbar({
  insertFormatting,
  insertTable,
  syncScroll,
  toggleSyncScroll,
  currentTheme,
}) {
  return (
    <div
      style={{
        backgroundColor: currentTheme.card,
        borderColor: currentTheme.border,
      }}
      className="h-8 border-b flex items-center justify-between px-3 text-xs shrink-0 select-none"
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

        <div
          style={{ backgroundColor: currentTheme.border }}
          className="h-3.5 w-[1px] mx-1"
        />

        <button
          onClick={() => insertFormatting('> ', '', 'Quote text')}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          title="Blockquote"
        >
          <Quote className="w-3 h-3" />
        </button>
        <button
          onClick={() =>
            insertFormatting('```javascript\n', '\n```\n', '// Code snippet')
          }
          className="p-1 hover:bg-white/10 rounded transition-colors"
          title="Code Block"
        >
          <Code className="w-3 h-3" />
        </button>
        <button
          onClick={() =>
            insertFormatting('[', '](https://example.com)', 'Link text')
          }
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
  );
}
