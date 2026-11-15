/* chapter.js — sklejanie notatek folderu w jeden "Rozdział" + pobieranie pliku */

// "lekcja1-wstep.md" → "lekcja1-wstep"
export function titleFromFilename(fileName) {
	const dot = fileName.lastIndexOf('.');
	const base = dot > 0 ? fileName.slice(0, dot) : fileName;
	return base.trim() || fileName;
}

/**
 * Skleja notatki (już posortowane po position) w jeden Markdown:
 *
 *   # Nazwa folderu
 *
 *   ## Tytuł notatki 1
 *
 *   treść...
 *
 * Wynik to zwykły .md, więc po pobraniu da się go zaimportować z powrotem
 * jako JEDNĄ notatkę (konwerter .md czyta go w całości).
 */
export function buildChapterMarkdown(folderName, notes) {
	const parts = [`# ${folderName}`];
	for (const note of notes) {
		parts.push(`## ${note.title}`);
		const body = (note.content ?? '').trim();
		if (body) parts.push(body);
	}
	return parts.join('\n\n') + '\n';
}

// Nazwa pliku bez znaków zakazanych w Windows/macOS
export function chapterFileName(folderName) {
	const safe = folderName.replace(/[\\/:*?"<>|]+/g, '-').trim() || 'rozdzial';
	return `${safe}.md`;
}

// Pobranie tekstu jako pliku — bez backendu: Blob → tymczasowy URL → <a download>
export function downloadTextFile(fileName, text, mime = 'text/markdown') {
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
// Pomysł: ten sam Markdown → HTML (jak w <Markdown />) → window.print()
// z arkuszem @media print, albo dynamiczny import biblioteki do PDF.
