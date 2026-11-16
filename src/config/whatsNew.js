// Changelog pokazywany w oknie "What's new" po zalogowaniu.
// NAJNOWSZY wpis na górze. Przy każdym PR z nową funkcją dopisz nowy obiekt
// na początku tablicy. `id` musi być unikalne i nigdy się nie zmieniać —
// to on trafia do profiles.last_seen_release.
export const RELEASES = [
	{
		id: '2026-11-password',
		date: '2026-11-17',
		title: 'Reset hasła i mocniejsze hasła',
		items: [
			'Nie pamiętasz hasła? Na ekranie logowania jest link „Nie pamiętasz hasła?”, który wyśle Ci maila z linkiem do ustawienia nowego.',
			'Nowe hasła muszą mieć co najmniej 8 znaków, wielką i małą literę, cyfrę oraz znak specjalny. Checklista podczas wpisywania pokazuje, czego jeszcze brakuje.',
			'Twoje obecne hasło nadal działa. Nowe wymagania dotyczą tylko zakładania konta i zmiany hasła.',
		],
	},
	{
		id: '2026-11-editor',
		date: '2026-11-16',
		title: 'Edytor notatek',
		items: [
			'Ołówek ✎ przy notatce otwiera edytor: pogrubienie, kursywa, nagłówki, listy, cytat, kod, kolor tekstu i zakreślacz.',
			'Rozdział pobierzesz teraz jako .html, który otworzysz w każdej przeglądarce albo wydrukujesz do PDF.',
			'Import obsługuje też pliki .html, więc pobrany Rozdział wczytasz z powrotem.',
			'Nie wiesz, od czego zacząć? Na liście folderów jest panel „Jak korzystać z notatek?”, a w folderze i edytorze przycisk ⓘ.',
		],
	},
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
