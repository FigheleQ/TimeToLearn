/* chapter.js — sklejanie notatek folderu w jeden "Rozdział" (HTML) + pobieranie pliku */
import { noteToHtml, escapeHtml } from './noteHtml';

// "lekcja1-wstep.md" → "lekcja1-wstep"
export function titleFromFilename(fileName) {
	const dot = fileName.lastIndexOf('.');
	const base = dot > 0 ? fileName.slice(0, dot) : fileName;
	return base.trim() || fileName;
}

/**
 * Skleja notatki (już posortowane po position) w jeden HTML:
 *
 *   <h1>Nazwa folderu</h1>
 *   <section><h2>Tytuł notatki 1</h2> …treść… </section>
 *
 * Każda notatka renderuje się według swojego formatu (markdown → HTML, html → bez zmian),
 * zawsze przez sanitizację z utils/noteHtml.js.
 */
export function buildChapterHtml(folderName, notes) {
	const parts = [`<h1>${escapeHtml(folderName)}</h1>`];
	for (const note of notes) {
		parts.push(
			`<section>\n<h2>${escapeHtml(note.title)}</h2>\n${noteToHtml(note)}\n</section>`,
		);
	}
	return parts.join('\n');
}

// Samodzielny plik .html do pobrania: otwiera się w każdej przeglądarce,
// a po ponownym imporcie aplikacja bierze tylko zawartość <body>.
export function buildChapterDocument(folderName, notes) {
	return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(folderName)}</title>
<style>
  body { max-width: 760px; margin: 40px auto; padding: 0 16px; font: 16px/1.7 system-ui, sans-serif; color: #1c1630; }
  h1 { font-size: 30px; } h2 { font-size: 22px; border-bottom: 1px solid #ddd0ff; padding-bottom: 6px; margin-top: 2em; }
  blockquote { border-left: 3px solid #a78bfa; margin-left: 0; padding: 2px 14px; color: #4a4560; }
  code { background: #f4f0ff; padding: .15em .4em; border-radius: 6px; }
  pre { background: #f6f4fb; padding: 14px 16px; border-radius: 12px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  mark { padding: 0 .15em; border-radius: 3px; }
</style>
</head>
<body>
${buildChapterHtml(folderName, notes)}
</body>
</html>
`;
}

// Nazwa pliku bez znaków zakazanych w Windows/macOS
export function chapterFileName(folderName, ext = 'html') {
	const safe = folderName.replace(/[\\/:*?"<>|]+/g, '-').trim() || 'rozdzial';
	return `${safe}.${ext}`;
}

// Pobranie tekstu jako pliku — bez backendu: Blob → tymczasowy URL → <a download>
export function downloadTextFile(fileName, text, mime = 'text/html') {
	const blob = new Blob([text], { type: `${mime};charset=utf-8` });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	a.remove();
	// zwolnienie po kliknięciu (przeglądarka już zaczęła pobieranie)
	setTimeout(() => URL.revokeObjectURL(url), 0);
}

// ─── Etap 2 ──────────────────────────────────────────────────────────────────
// export async function exportChapterToPdf(folderName, notes) { ... }
// Pomysł: buildChapterDocument → nowe okno → window.print() (zapis do PDF w przeglądarce).
