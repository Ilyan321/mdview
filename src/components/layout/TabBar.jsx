import React from 'react';
import { FileText, X, Plus } from 'lucide-react';

export default function TabBar({
  documents,
  activeDocId,
  setActiveDocId,
  closeDocument,
  createNewDocument,
  currentTheme,
}) {
  return (
    <div
      style={{
        backgroundColor: currentTheme.bg,
        borderColor: currentTheme.border,
      }}
      className="h-9 border-b flex items-center px-1 overflow-x-auto select-none shrink-0"
    >
      {documents.map((doc) => {
        const isActive = doc.id === activeDocId;
        return (
          <div
            key={doc.id}
            onClick={() => setActiveDocId(doc.id)}
            style={{
              backgroundColor: isActive ? currentTheme.card : 'transparent',
              borderColor: currentTheme.border,
            }}
            className={`h-full flex items-center space-x-2 px-3 text-xs font-mono border-r border-t cursor-pointer transition-colors relative ${
              isActive
                ? 'text-blue-400 font-semibold border-t-2 border-t-blue-500'
                : 'border-t-transparent opacity-60 hover:opacity-100'
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
  );
}
