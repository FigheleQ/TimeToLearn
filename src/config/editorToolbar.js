/* editorToolbar.js — przyciski paska narzędzi edytora notatek
 *
 * SZKIELET: wygląd i rozmieszczenie przycisków są gotowe (EditorToolbar.jsx czyta tę tablicę).
 * Dla każdego przycisku dopisujesz dwie funkcje:
 *   run(editor, value)      — wykonuje formatowanie na zaznaczonym tekście
 *   isActive(editor, value) — true, gdy kursor stoi w tak sformatowanym tekście (podświetlenie przycisku)
 * value to kolor (tylko dla grup 'color' i 'highlight'), dla reszty undefined.
 */

// Paleta z motywu aplikacji
export const TEXT_COLORS = [
	{ name: 'Fiolet', value: '#7c5cff' },
	{ name: 'Koral', value: '#e5487a' },
	{ name: 'Zieleń', value: '#2faa8c' },
	{ name: 'Pomarańcz', value: '#e07b16' },
	{ name: 'Niebieski', value: '#2f6fe0' },
];

export const HIGHLIGHT_COLORS = [
	{ name: 'Żółty', value: '#fff3a3' },
	{ name: 'Lawendowy', value: '#e4d9ff' },
	{ name: 'Miętowy', value: '#c9f2e3' },
	{ name: 'Różowy', value: '#ffd6e2' },
];

// group: grupy oddzielone w pasku pionową kreską
// label: tekst na przycisku, title: podpowiedź po najechaniu
export const TOOLBAR_BUTTONS = [
	{
		id: 'bold',
		group: 'text',
		label: 'B',
		title: 'Pogrubienie (Ctrl+B)',
		isActive: (editor) => editor.isActive('bold'),
		run: (editor) => {
			editor.chain().focus().toggleBold().run();
		},
	},
	{
		id: 'italic',
		group: 'text',
		label: 'I',
		title: 'Kursywa (Ctrl+I)',
		isActive: (editor) => editor.isActive('italic'),
		run: (editor) => {
			editor.chain().focus().toggleItalic().run();
		},
	},
	{
		id: 'strike',
		group: 'text',
		label: 'S',
		title: 'Przekreślenie',
		isActive: (editor) => editor.isActive('strike'),
		run: (editor) => {
			editor.chain().focus().toggleStrike().run();
		},
	},
	{
		id: 'h1',
		group: 'size',
		label: 'H1',
		title: 'Duży nagłówek',
		isActive: (editor) => editor.isActive('heading', { level: 1 }),
		run: (editor) => {
			editor.chain().focus().toggleHeading({ level: 1 }).run();
		},
	},
	{
		id: 'h2',
		group: 'size',
		label: 'H2',
		title: 'Średni nagłówek',
		isActive: (editor) => editor.isActive('heading', { level: 2 }),
		run: (editor) => {
			editor.chain().focus().toggleHeading({ level: 2 }).run();
		},
	},
	{
		id: 'h3',
		group: 'size',
		label: 'H3',
		title: 'Mały nagłówek',
		isActive: (editor) => editor.isActive('heading', { level: 3 }),
		run: (editor) => {
			editor.chain().focus().toggleHeading({ level: 3 }).run();
		},
	},
	{
		id: 'bulletList',
		group: 'block',
		label: '• Lista',
		title: 'Lista punktowana',
		isActive: (editor) => editor.isActive('bulletList'),
		run: (editor) => {
			editor.chain().focus().toggleBulletList().run();
		},
	},
	{
		id: 'orderedList',
		group: 'block',
		label: '1. Lista',
		title: 'Lista numerowana',
		isActive: (editor) => editor.isActive('orderedList'),
		run: (editor) => {
			editor.chain().focus().toggleOrderedList().run();
		},
	},
	{
		id: 'blockquote',
		group: 'block',
		label: '❝',
		title: 'Cytat',
		isActive: (editor) => editor.isActive('blockquote'),
		run: (editor) => {
			editor.chain().focus().toggleBlockquote().run();
		},
	},
	{
		id: 'code',
		group: 'block',
		label: '</>',
		title: 'Kod w linii',
		isActive: (editor) => editor.isActive('code'),
		run: (editor) => {
			editor.chain().focus().toggleCode().run();
		},
	},
	{
		id: 'codeBlock',
		group: 'block',
		label: '{ }',
		title: 'Blok kodu',
		isActive: (editor) => editor.isActive('codeBlock'),
		run: (editor) => {
			editor.chain().focus().toggleCodeBlock().run();
		},
	},
];

// Kolor tekstu — jeden "przycisk" na każdą próbkę z TEXT_COLORS (value = kolor)
export const COLOR_ACTIONS = {
	isActive: (editor, value) => {
		return editor.isActive('textStyle', { color: value });
	},
	run: (editor, value) => {
		editor.chain().focus().setColor(value).run();
	},
	clear: (editor) => editor.chain().focus().unsetColor().run(),
};

// Zakreślacz — jak wyżej, dla HIGHLIGHT_COLORS
export const HIGHLIGHT_ACTIONS = {
	run: (editor, value) => {
		editor.chain().focus().setHighlight({ color: value }).run();
	},
	isActive: (editor, value) => {
		return editor.isActive('highlight', { color: value });
	},
	clear: (editor) => editor.chain().focus().unsetHighlight().run(),
};
