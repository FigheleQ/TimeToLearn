/* fileConverters.js — zamiana pliku z dysku na sam tekst (w przeglądarce)
 *
 * Jeden wspólny punkt wejścia: convertFileToText(file).
 * Każdy format to jeden wpis w CONVERTERS — dodanie nowego formatu
 * nie wymaga zmian w stronach, tylko nowego konwertera tutaj.
 */

// 1 MB tekstu (UTF-8, w bajtach)
export const MAX_TEXT_BYTES = 1024 * 1024;

export class UnsupportedFileError extends Error {
	constructor(fileName) {
		super(`Nieobsługiwany format pliku: ${fileName}`);
		this.name = 'UnsupportedFileError';
		this.reason = 'format';
	}
}

export class FileTooLargeError extends Error {
	constructor(fileName, bytes) {
		const mb = (bytes / (1024 * 1024)).toFixed(2);
		super(`Plik ${fileName} ma ${mb} MB tekstu — limit to 1 MB`);
		this.name = 'FileTooLargeError';
		this.reason = 'size';
	}
}

// Pliki tekstowe czytamy natywnie (file.text() dekoduje jako UTF-8).
const readPlainText = (file) => file.text();

// rozszerzenie → { sourceType, convert(file) => Promise<string>, isText }
// isText: true → rozmiar pliku ≈ rozmiar tekstu, więc limit sprawdzamy
// przed czytaniem (nie ładujemy 50 MB do pamięci tylko po to, żeby odrzucić).
export const CONVERTERS = {
	md: { sourceType: 'markdown', convert: readPlainText, isText: true },
	markdown: { sourceType: 'markdown', convert: readPlainText, isText: true },
	txt: { sourceType: 'text', convert: readPlainText, isText: true },

	// ─── Etap 2 (jeszcze nieaktywne) ─────────────────────────────────────────
	// Ciężkie biblioteki ładujemy dynamicznym import(), żeby nie trafiły
	// do głównego bundla, dopóki ktoś faktycznie nie zaimportuje PDF/DOCX.
	//
	// pdf: {
	// 	sourceType: 'pdf',
	// 	isText: false,
	// 	convert: async (file) => {
	// 		const pdfjs = await import('pdfjs-dist');
	// 		// getDocument({ data: await file.arrayBuffer() }) → strony → getTextContent()
	// 	},
	// },
	// docx: {
	// 	sourceType: 'docx',
	// 	isText: false,
	// 	convert: async (file) => {
	// 		const mammoth = await import('mammoth');
	// 		// mammoth.convertToMarkdown({ arrayBuffer: await file.arrayBuffer() })
	// 	},
	// },
};

export function getExtension(fileName) {
	const dot = fileName.lastIndexOf('.');
	if (dot <= 0) return '';
	return fileName.slice(dot + 1).toLowerCase();
}

export function isSupportedFile(file) {
	return getExtension(file.name) in CONVERTERS;
}

// Lista obsługiwanych rozszerzeń dla atrybutu accept=".md,.txt"
export const ACCEPT_ATTR = Object.keys(CONVERTERS)
	.map((ext) => `.${ext}`)
	.join(',');

/**
 * Zamienia plik na tekst.
 * @param {File} file
 * @returns {Promise<{ text: string, sourceType: string }>}
 * @throws {UnsupportedFileError | FileTooLargeError}
 */
export async function convertFileToText(file) {
	const converter = CONVERTERS[getExtension(file.name)];
	if (!converter) throw new UnsupportedFileError(file.name);

	if (converter.isText && file.size > MAX_TEXT_BYTES) {
		throw new FileTooLargeError(file.name, file.size);
	}

	const text = await converter.convert(file);

	// dla PDF/DOCX (etap 2) liczy się rozmiar WYCIĄGNIĘTEGO tekstu
	const bytes = new TextEncoder().encode(text).length;
	if (bytes > MAX_TEXT_BYTES) throw new FileTooLargeError(file.name, bytes);

	return { text, sourceType: converter.sourceType };
}
