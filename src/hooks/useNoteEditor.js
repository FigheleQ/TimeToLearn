/* useNoteEditor.js — konfiguracja edytora TipTap dla notatek
 *
 * Gotowe w całości. Rozszerzenia = to, co pozwala zrobić pasek narzędzi:
 *   StarterKit  → pogrubienie, kursywa, przekreślenie, nagłówki H1–H3, listy, cytat, kod, blok kodu
 *   TextStyle + Color → kolor tekstu (<span style="color: …">)
 *   Highlight (multicolor) → zakreślacz (<mark data-color="…" style="background-color: …">)
 */
import { useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';

export const EDITOR_EXTENSIONS = [
	StarterKit.configure({
		heading: { levels: [1, 2, 3] },
		link: false, // linków nie obsługujemy (mniej powierzchni na javascript: URL-e)
	}),
	TextStyle,
	Color,
	Highlight.configure({ multicolor: true }),
];

export function useNoteEditor() {
	return useEditor({
		extensions: EDITOR_EXTENSIONS,
		content: '',
		editorProps: {
			attributes: {
				class: 'md-body note-editor-content',
				'data-testid': 'note-editor-content',
				'aria-label': 'Treść notatki',
			},
		},
	});
}

// Edytor bywa już zniszczony, zanim React skończy render (StrictMode montuje komponent dwa razy,
// TipTap niszczy pierwszy egzemplarz). Wtedy getHTML()/isActive() wywalają się — trzeba to sprawdzić.
export function isEditorReady(editor) {
	return !!editor && !editor.isDestroyed;
}

// Aktualny HTML edytora jako stan Reacta — komponent przerysuje się przy każdej zmianie treści
export function useEditorHtml(editor) {
	return useEditorState({
		editor,
		selector: ({ editor: e }) => (isEditorReady(e) ? e.getHTML() : ''),
	});
}
