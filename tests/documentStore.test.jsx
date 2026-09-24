import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useDocumentStore, INITIAL_DOCS } from '../src/hooks/useDocumentStore';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Lightweight React 19 hook test harness
function renderDocumentStore(mockToast = vi.fn()) {
  const result = {};
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  function TestComponent() {
    result.current = useDocumentStore(mockToast);
    return null;
  }

  act(() => {
    root.render(<TestComponent />);
  });

  return {
    result,
    mockToast,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

describe('Document Store: Local Vault & Document Management', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('hydrates initial documents from default templates when localStorage is empty', () => {
    const { result, unmount } = renderDocumentStore();

    expect(result.current.documents).toHaveLength(3);
    expect(result.current.documents[0].title).toBe('README.md');
    expect(result.current.documents[1].title).toBe('ARCHITECTURE.md');
    expect(result.current.documents[2].title).toBe('SHOWCASE.md');
    expect(result.current.activeDocId).toBe('doc-1');
    expect(result.current.activeDoc.title).toBe('README.md');

    unmount();
  });

  it('recovers gracefully from corrupted localStorage JSON without crashing', () => {
    localStorage.setItem('mdview_studio_docs', 'INVALID_JSON_CORRUPT{');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result, unmount } = renderDocumentStore();

    expect(result.current.documents).toEqual(INITIAL_DOCS);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    unmount();
  });

  it('updates active document content and sets isModified to true', () => {
    const { result, unmount } = renderDocumentStore();

    act(() => {
      result.current.updateActiveContent('# Modified Content for Testing');
    });

    expect(result.current.activeDoc.content).toBe('# Modified Content for Testing');
    expect(result.current.activeDoc.isModified).toBe(true);

    // Verify localStorage sync
    const saved = JSON.parse(localStorage.getItem('mdview_studio_docs'));
    expect(saved[0].content).toBe('# Modified Content for Testing');

    unmount();
  });

  it('creates new document and automatically switches activeDocId', () => {
    const { result, mockToast, unmount } = renderDocumentStore();

    let createdDoc;
    act(() => {
      createdDoc = result.current.createNewDocument();
    });

    expect(result.current.documents).toHaveLength(4);
    expect(createdDoc.title).toBe('untitled-4.md');
    expect(result.current.activeDocId).toBe(createdDoc.id);
    expect(mockToast).toHaveBeenCalledWith('Created untitled-4.md');

    unmount();
  });

  it('creates document from specified template key', () => {
    const { result, mockToast, unmount } = renderDocumentStore();

    let createdDoc;
    act(() => {
      createdDoc = result.current.createNewDocument('spec');
    });

    expect(createdDoc.title).toBe('technical-architecture-spec.md');
    expect(result.current.activeDocId).toBe(createdDoc.id);
    expect(mockToast).toHaveBeenCalledWith('Created technical-architecture-spec.md');

    unmount();
  });

  it('renames documents and enforces .md file extension', () => {
    const { result, mockToast, unmount } = renderDocumentStore();

    act(() => {
      result.current.renameDocument('doc-1', 'release-notes');
    });

    expect(result.current.documents[0].title).toBe('release-notes.md');
    expect(mockToast).toHaveBeenCalledWith('Renamed to release-notes.md');

    // Renaming with .md already attached
    act(() => {
      result.current.renameDocument('doc-1', 'changelog.md');
    });
    expect(result.current.documents[0].title).toBe('changelog.md');

    // Rejecting empty names
    act(() => {
      result.current.renameDocument('doc-1', '   ');
    });
    expect(result.current.documents[0].title).toBe('changelog.md');

    unmount();
  });

  it('closes document tab and switches active selection to adjacent tab', () => {
    const { result, unmount } = renderDocumentStore();

    act(() => {
      result.current.setActiveDocId('doc-2');
    });
    expect(result.current.activeDocId).toBe('doc-2');

    act(() => {
      result.current.closeDocument('doc-2');
    });

    expect(result.current.documents).toHaveLength(2);
    expect(result.current.documents.find((d) => d.id === 'doc-2')).toBeUndefined();
    // Switched to last document
    expect(result.current.activeDocId).toBe('doc-3');

    unmount();
  });

  it('prevents closing or deleting the last open document', () => {
    const { result, mockToast, unmount } = renderDocumentStore();

    // Close down to 1 document sequentially across ticks
    act(() => {
      result.current.closeDocument('doc-2');
    });
    act(() => {
      result.current.closeDocument('doc-3');
    });
    expect(result.current.documents).toHaveLength(1);

    // Attempt to close the only remaining document
    act(() => {
      result.current.closeDocument('doc-1');
    });
    expect(result.current.documents).toHaveLength(1);
    expect(mockToast).toHaveBeenCalledWith('Cannot close the last open document', 'ℹ️');

    unmount();
  });

  it('calculates telemetry statistics accurately', () => {
    const { result, unmount } = renderDocumentStore();

    act(() => {
      result.current.updateActiveContent('Word one two three four five.\nSecond line here.');
    });

    expect(result.current.stats.words).toBe(9);
    expect(result.current.stats.lines).toBe(2);
    expect(result.current.stats.chars).toBe(47);
    expect(result.current.stats.readingTime).toBe(1);

    unmount();
  });

  it('resets local vault to initial state via resetAllDocuments', () => {
    const { result, mockToast, unmount } = renderDocumentStore();

    act(() => {
      result.current.updateActiveContent('Dirty text');
      result.current.createNewDocument();
    });
    expect(result.current.documents.length).toBeGreaterThan(3);

    act(() => {
      result.current.resetAllDocuments();
    });

    expect(result.current.documents).toEqual(INITIAL_DOCS);
    expect(result.current.activeDocId).toBe('doc-1');
    expect(JSON.parse(localStorage.getItem('mdview_studio_docs'))).toEqual(INITIAL_DOCS);
    expect(mockToast).toHaveBeenCalledWith('Reset to default documents');

    unmount();
  });

  it('restores vault backup when valid JSON data is provided', () => {
    const { result, mockToast, unmount } = renderDocumentStore();

    const customBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      documents: [
        { id: 'doc-imported', title: 'imported.md', content: '# Imported', isModified: false }
      ]
    };

    act(() => {
      result.current.importVaultBackupJson(customBackup);
    });

    expect(result.current.documents).toHaveLength(1);
    expect(result.current.activeDocId).toBe('doc-imported');
    expect(result.current.activeDoc.title).toBe('imported.md');
    expect(mockToast).toHaveBeenCalledWith('Restored 1 documents from vault backup');

    // Invalid backup format
    act(() => {
      result.current.importVaultBackupJson({ corrupted: true });
    });
    expect(mockToast).toHaveBeenCalledWith('Invalid backup file structure', '⚠️');

    unmount();
  });
});
