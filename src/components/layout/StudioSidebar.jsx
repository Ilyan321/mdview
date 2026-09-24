import React from 'react';
import { FolderOpen, ListTree, Plus, FileCode, Trash2 } from 'lucide-react';

export default function StudioSidebar({
  sidebarOpen,
  sidebarTab,
  setSidebarTab,
  documents,
  setDocuments,
  activeDocId,
  setActiveDocId,
  createNewDocument,
  deleteDocument,
  outline,
  jumpToLine,
  currentTheme,
}) {
  if (!sidebarOpen) return null;

  return (
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
          className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
            sidebarTab === 'explorer'
              ? 'bg-white/10 text-blue-400'
              : 'opacity-60 hover:opacity-100'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Explorer</span>
        </button>
        <button
          onClick={() => setSidebarTab('outline')}
          className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
            sidebarTab === 'outline'
              ? 'bg-white/10 text-blue-400'
              : 'opacity-60 hover:opacity-100'
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
              const isActive = doc.id === activeDocId;
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
                  className="w-full text-left py-1 pr-2 rounded hover:bg-white/5 truncate flex items-center space-x-1.5 opacity-80 hover:opacity-100 hover:text-blue-400 transition-colors"
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
  );
}
