import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView, keymap } from '@codemirror/view';
import { search, searchKeymap } from '@codemirror/search';

export default function CodeMirrorEditor({
  activeDoc,
  updateActiveContent,
  cmCustomTheme,
  editorViewRef,
  setCursorPos,
  handleScrollUpdate,
  viewMode,
  splitRatio,
}) {
  if (viewMode !== 'split' && viewMode !== 'editor') return null;

  return (
    <div
      style={{
        width: viewMode === 'split' ? `${splitRatio}%` : '100%',
      }}
      className="h-full flex flex-col relative overflow-hidden bg-transparent"
    >
      <CodeMirror
        value={activeDoc?.content || ''}
        height="100%"
        className="h-full flex-1 overflow-auto"
        extensions={[
          markdown(),
          EditorView.lineWrapping,
          search({ top: true }),
          keymap.of(searchKeymap),
          cmCustomTheme,
          EditorView.updateListener.of((update) => {
            if (update.view) {
              editorViewRef.current = update.view;
            }
            if (update.selectionSet) {
              const pos = update.state.selection.main.head;
              const line = update.state.doc.lineAt(pos);
              setCursorPos({
                line: line.number,
                col: pos - line.from + 1,
              });
            }
            if (update.docChanged) {
              updateActiveContent(update.state.doc.toString());
            }
            handleScrollUpdate(update.view);
          }),
        ]}
        onCreateEditor={(view) => {
          editorViewRef.current = view;
        }}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          indentOnInput: true,
        }}
      />
    </div>
  );
}
