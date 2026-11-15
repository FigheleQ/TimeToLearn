// Changelog pokazywany w oknie "What's new" po zalogowaniu.
// NAJNOWSZY wpis na górze. Przy każdym PR z nową funkcją dopisz nowy obiekt
// na początku tablicy. `id` musi być unikalne i nigdy się nie zmieniać —
// to on trafia do profiles.last_seen_release.
export const RELEASES = [
	{
		id: '2026-11-notes',
		date: '2026-11-15',
		title: 'Notatki → Rozdział',
		items: [
			'Nowa zakładka „Notatki” w menu: twórz foldery, np. „lekcja1”.',
			'Importuj pliki .md i .txt pojedynczo albo cały folder z dysku. Zapisujemy sam tekst.',
			'Ponowny import pliku o tej samej nazwie nadpisuje notatkę (po potwierdzeniu).',
			'Przeciągaj notatki, żeby ustalić ich kolejność.',
			'„Rozdział” skleja notatki folderu w jeden tekst, który pobierzesz jako .md.',
		],
	},
];
