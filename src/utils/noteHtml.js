/* noteHtml.js — jedno miejsce, które zamienia treść notatki na bezpieczny HTML
 *
 * Notatka ma content_format:
 *   'markdown' — import .md/.txt (jeszcze nieedytowana)
 *   'html'     — po zapisie w edytorze WYSIWYG albo import .html
 * Wszystko, co trafia do dangerouslySetInnerHTML albo do edytora, przechodzi przez sanitizeHtml.
 */
import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ gfm: true, breaks: false });

// Z atrybutu style przepuszczamy tylko kolor tekstu i tło (to, co ustawia edytor).
// Reszta (position, url(...), itp.) wylatuje — nic z importowanego pliku nie przykryje UI.
const ALLOWED_STYLE_PROPS = new Set(['color', 'background-color']);
const SAFE_COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|[a-z]+)$/i;

DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
	if (data.attrName !== 'style') return;
	const kept = data.attrValue
		.split(';')
		.map((decl) => decl.split(':').map((p) => p.trim()))
		.filter(
			([prop, value]) =>
				prop && value && ALLOWED_STYLE_PROPS.has(prop.toLowerCase()) && SAFE_COLOR.test(value),
		)
		.map(([prop, value]) => `${prop.toLowerCase()}: ${value}`);
	if (kept.length === 0) data.keepAttr = false;
	else data.attrValue = kept.join('; ');
});

const PURIFY_CONFIG = {
	ADD_ATTR: ['data-color'], // zakreślacz TipTapa: <mark data-color="#...">
	FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select'],
};

export function sanitizeHtml(html) {
	return DOMPurify.sanitize(html ?? '', PURIFY_CONFIG);
}

export function markdownToHtml(markdown) {
	return sanitizeHtml(marked.parse(markdown ?? ''));
}

// Bezpieczny HTML dla dowolnej notatki, niezależnie od formatu
export function noteToHtml(note) {
	return note.content_format === 'html'
		? sanitizeHtml(note.content)
		: markdownToHtml(note.content);
}

// Tekst do wstawienia w HTML (np. tytuł notatki w <h2>)
export function escapeHtml(text) {
	return String(text ?? '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

// Ze wczytanego pliku .html bierzemy tylko zawartość <body> (bez <head>, skryptów, stylów)
export function htmlFileToContent(text) {
	const doc = new DOMParser().parseFromString(text, 'text/html');
	return sanitizeHtml(doc.body ? doc.body.innerHTML : text).trim();
}
