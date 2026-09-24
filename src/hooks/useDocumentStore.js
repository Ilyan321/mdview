import { useState, useEffect, useMemo, useCallback } from 'react';
import { TEMPLATES } from '../templates';

export const INITIAL_DOCS = [
  {
    id: 'doc-1',
    title: 'README.md',
    content: TEMPLATES.readme.content,
    isModified: false,
  },
  {
    id: 'doc-2',
    title: 'ARCHITECTURE.md',
    content: TEMPLATES.spec.content,
    isModified: false,
  },
  {
    id: 'doc-3',
    title: 'SHOWCASE.md',
    content: TEMPLATES.showcase.content,
    isModified: false,
  }
];

export function useDocumentStore(showToast) {
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem('mdview_studio_docs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved documents from localStorage:', e);
    }
    return INITIAL_DOCS;
  });

  const [activeDocId, setActiveDocId] = useState(() => {
    return localStorage.getItem('mdview_active_doc_id') || 'doc-1';
  });

  const [lastSaved, setLastSaved] = useState(new Date());

  // Active Document Helper
  const activeDoc = useMemo(() => {
    return documents.find((d) => d.id === activeDocId) || documents[0] || INITIAL_DOCS[0];
  }, [documents, activeDocId]);

  // Auto-Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('mdview_studio_docs', JSON.stringify(documents));
    localStorage.setItem('mdview_active_doc_id', activeDocId);
    setLastSaved(new Date());
  }, [documents, activeDocId]);

  // Statistics
  const stats = useMemo(() => {
    const text = (activeDoc?.content || '').trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const lines = (activeDoc?.content || '').split('\n').length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, lines, readingTime };
  }, [activeDoc?.content]);

  // Document Operations
  const updateActiveContent = useCallback((newContent) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === activeDoc.id
          ? { ...doc, content: newContent, isModified: true }
          : doc
      )
    );
  }, [activeDoc.id]);

  const createNewDocument = useCallback((templateKey = null) => {
    const tmpl = templateKey ? TEMPLATES[templateKey] : null;
    const newId = `doc-${Date.now()}`;
    const newDoc = {
      id: newId,
      title: tmpl ? `${tmpl.name.toLowerCase().replace(/\s+/g, '-')}.md` : `untitled-${documents.length + 1}.md`,
      content: tmpl ? tmpl.content : '# Untitled Document\n\nStart typing markdown here...',
      isModified: false,
    };
    setDocuments((prev) => [...prev, newDoc]);
    setActiveDocId(newId);
    if (showToast) showToast(`Created ${newDoc.title}`);
    return newDoc;
  }, [documents.length, showToast]);

  const closeDocument = useCallback((docId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (documents.length <= 1) {
      if (showToast) showToast('Cannot close the last open document', 'ℹ️');
      return;
    }
    const filtered = documents.filter((d) => d.id !== docId);
    setDocuments(filtered);
    if (activeDocId === docId) {
      setActiveDocId(filtered[filtered.length - 1].id);
    }
  }, [documents, activeDocId, showToast]);

  const deleteDocument = useCallback((docId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (documents.length <= 1) {
      if (showToast) showToast('Cannot delete the last document', 'ℹ️');
      return;
    }
    const docToDelete = documents.find((d) => d.id === docId);
    if (window.confirm(`Delete "${docToDelete?.title}"?`)) {
      closeDocument(docId, e);
      if (showToast) showToast(`Deleted ${docToDelete?.title}`);
    }
  }, [documents, closeDocument, showToast]);

  const renameDocument = useCallback((docId, newTitle) => {
    if (!newTitle || !newTitle.trim()) return;
    const sanitizedTitle = newTitle.trim().endsWith('.md') ? newTitle.trim() : `${newTitle.trim()}.md`;
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, title: sanitizedTitle } : doc
      )
    );
    if (showToast) showToast(`Renamed to ${sanitizedTitle}`);
  }, [showToast]);

  const exportAllDocumentsJson = useCallback(() => {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      documents,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mdview-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    if (showToast) showToast('Vault backup exported successfully');
  }, [documents, showToast]);

  const resetAllDocuments = useCallback(() => {
    setDocuments(INITIAL_DOCS);
    setActiveDocId('doc-1');
    localStorage.removeItem('mdview_studio_docs');
    localStorage.removeItem('mdview_active_doc_id');
    if (showToast) showToast('Reset to default documents');
  }, [showToast]);

  return {
    documents,
    setDocuments,
    activeDocId,
    setActiveDocId,
    activeDoc,
    lastSaved,
    stats,
    updateActiveContent,
    createNewDocument,
    closeDocument,
    deleteDocument,
    renameDocument,
    exportAllDocumentsJson,
    resetAllDocuments,
  };
}
