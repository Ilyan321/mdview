import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, FileText, X, CornerDownLeft, ArrowDown, ArrowUp } from 'lucide-react';

export default function QuickOpenModal({
  isOpen,
  onClose,
  documents = [],
  activeDocId,
  onSelectDoc,
  currentTheme,
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Auto-focus on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  // Compute filtered & scored results
  const filteredDocs = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return documents.map((doc) => ({
        ...doc,
        matchSnippet: null,
        score: 1,
      }));
    }

    const results = [];
    for (const doc of documents) {
      const titleLower = (doc.title || '').toLowerCase();
      const contentLower = (doc.content || '').toLowerCase();

      let score = 0;
      let matchSnippet = null;

      // 1. Title match evaluation
      if (titleLower === trimmed) {
        score += 200;
      } else if (titleLower.startsWith(trimmed)) {
        score += 100;
      } else if (titleLower.includes(trimmed)) {
        score += 50;
      }

      // 2. Content snippet match evaluation
      const contentIdx = contentLower.indexOf(trimmed);
      if (contentIdx !== -1) {
        score += 20;
        const start = Math.max(0, contentIdx - 35);
        const end = Math.min(doc.content.length, contentIdx + trimmed.length + 45);
        let excerpt = doc.content.slice(start, end).replace(/\n+/g, ' ');
        if (start > 0) excerpt = '...' + excerpt;
        if (end < doc.content.length) excerpt = excerpt + '...';
        matchSnippet = excerpt;
      }

      if (score > 0) {
        results.push({
          ...doc,
          matchSnippet,
          score,
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }, [documents, query]);

  // Keep selected index within valid range
  useEffect(() => {
    if (selectedIndex >= filteredDocs.length) {
      setSelectedIndex(Math.max(0, filteredDocs.length - 1));
    }
  }, [filteredDocs.length, selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredDocs.length ? (prev + 1) % filteredDocs.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        filteredDocs.length ? (prev - 1 + filteredDocs.length) % filteredDocs.length : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredDocs[selectedIndex]) {
        onSelectDoc(filteredDocs[selectedIndex].id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 select-none animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: currentTheme.card,
          borderColor: currentTheme.border,
          color: currentTheme.text,
        }}
        className="w-full max-w-xl rounded-xl shadow-2xl border flex flex-col overflow-hidden max-h-[75vh]"
      >
        {/* Search Input Bar */}
        <div
          style={{ borderColor: currentTheme.border }}
          className="flex items-center px-3.5 py-3 border-b space-x-2.5"
        >
          <Search className="w-4 h-4 text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type document name or content to jump..."
            style={{ color: currentTheme.text }}
            className="w-full bg-transparent text-sm focus:outline-none placeholder:opacity-40"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="p-1 rounded hover:bg-neutral-500/20 opacity-60 hover:opacity-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd
            style={{ borderColor: currentTheme.border }}
            className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-mono opacity-50 border rounded bg-neutral-500/10"
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto max-h-[380px] p-1.5 space-y-1">
          {filteredDocs.length === 0 ? (
            <div className="py-8 text-center text-xs opacity-50">
              No documents found matching "{query}"
            </div>
          ) : (
            filteredDocs.map((doc, idx) => {
              const isSelected = idx === selectedIndex;
              const isActive = doc.id === activeDocId;
              const wordCount = doc.content ? doc.content.trim().split(/\s+/).filter(Boolean).length : 0;

              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    onSelectDoc(doc.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    backgroundColor: isSelected
                      ? currentTheme.mode === 'dark'
                        ? 'rgba(56, 139, 253, 0.15)'
                        : 'rgba(9, 105, 218, 0.1)'
                      : 'transparent',
                    borderColor: isSelected ? currentTheme.accent : 'transparent',
                  }}
                  className={`px-3 py-2 rounded-lg cursor-pointer transition-all border-l-2 flex flex-col space-y-1 ${
                    isSelected ? 'font-medium' : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0">
                      <FileText
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? 'text-blue-400' : 'opacity-60'
                        }`}
                      />
                      <span className="text-xs truncate font-mono">
                        {doc.title}
                      </span>
                      {isActive && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-sans font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] opacity-50 shrink-0 font-mono">
                      <span>{wordCount} words</span>
                      {isSelected && (
                        <CornerDownLeft className="w-3 h-3 text-blue-400" />
                      )}
                    </div>
                  </div>

                  {/* Context Snippet */}
                  {doc.matchSnippet && (
                    <div
                      style={{ color: currentTheme.text }}
                      className="text-[11px] opacity-70 font-mono pl-5 truncate bg-neutral-500/10 px-1.5 py-0.5 rounded"
                    >
                      {doc.matchSnippet}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Telemetry / Keyboard Hints Footer */}
        <div
          style={{ borderColor: currentTheme.border }}
          className="px-3.5 py-2 border-t flex items-center justify-between text-[11px] opacity-50"
        >
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="font-mono bg-neutral-500/20 px-1 rounded text-[9px]">↑</kbd>
              <kbd className="font-mono bg-neutral-500/20 px-1 rounded text-[9px]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="font-mono bg-neutral-500/20 px-1 rounded text-[9px]">↵</kbd>
              <span>to switch</span>
            </span>
          </div>
          <span className="font-mono text-[10px]">
            {filteredDocs.length} {filteredDocs.length === 1 ? 'document' : 'documents'}
          </span>
        </div>
      </div>
    </div>
  );
}
