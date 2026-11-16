// Treść pomocy modułu Notatki — jedno źródło dla panelu na liście folderów
// i okienka „?” w widoku folderu oraz edytorze.
// focus: który widok otwiera daną sekcję jako pierwszą (folders | folder | editor)
export const NOTES_HELP = [
	{
		id: 'folders',
		title: 'Foldery',
		focus: ['folders'],
		items: [
			'„Nowy folder” tworzy miejsce na notatki z jednego tematu, np. „lekcja1”.',
			'Ołówek przy folderze zmienia nazwę (Enter zapisuje, Esc anuluje), ✕ usuwa folder razem z notatkami (zawsze z pytaniem).',
		],
	},
	{
		id: 'import',
		title: 'Import plików',
		focus: ['folder'],
		items: [
			'W folderze kliknij „Pliki”, żeby wybrać jeden lub kilka plików, albo „Cały folder”, żeby wczytać wszystko z katalogu na dysku.',
			'Obsługiwane formaty: .md, .txt oraz .html. Inne pliki są pomijane i pokazane na liście „Pominięte pliki”.',
			'Limit to 1 MB tekstu na plik. Zapisujemy sam tekst: bez obrazków i bez oryginalnych plików.',
			'Ponowny import pliku o tej samej nazwie zapyta, czy nadpisać notatkę. „Nadpisz” podmienia treść i zostawia notatkę na jej miejscu, „Pomiń” zostawia starą.',
		],
	},
	{
		id: 'order',
		title: 'Kolejność',
		focus: ['folder'],
		items: [
			'Na komputerze złap notatkę za uchwyt ⋮⋮ i przeciągnij ją wyżej lub niżej. Na telefonie i tablecie użyj strzałek ↑ ↓ przy notatce. Kolejność zapisuje się od razu.',
			'W tej samej kolejności notatki pojawią się w Rozdziale i w pobranym pliku.',
		],
	},
	{
		id: 'editor',
		title: 'Edycja notatki',
		focus: ['folder', 'editor'],
		items: [
			'Ołówek ✎ przy notatce otwiera edytor. Zmień tytuł u góry, a treść formatuj jak w edytorze tekstu.',
			'Pasek narzędzi: B / I / S (pogrubienie, kursywa, przekreślenie), H1–H3 (większy tekst), listy, cytat, kod, kolor tekstu i zakreślacz. ✕ przy kolorach usuwa kolor lub zakreślenie.',
			'Najpierw zaznacz tekst, potem kliknij przycisk. Skróty: Ctrl+B, Ctrl+I, Ctrl+Z (cofnij).',
			'„● niezapisane” przy nagłówku znaczy, że masz zmiany do zapisania. „Anuluj” zapyta, czy je porzucić.',
			'Notatka zaimportowana z .md otwiera się już sformatowana. Po zapisie jest przechowywana jako sformatowany tekst (HTML).',
		],
	},
	{
		id: 'chapter',
		title: 'Rozdział i eksport',
		focus: ['folder'],
		items: [
			'„Rozdział” w widoku folderu skleja wszystkie notatki w jeden tekst, z tytułem każdej notatki jako nagłówkiem.',
			'„Pobierz .html” zapisuje Rozdział jako plik, który otworzysz w każdej przeglądarce albo wydrukujesz do PDF.',
			'Pobrany plik możesz zaimportować z powrotem (np. do innego folderu). Trafi tam jako jedna notatka.',
		],
	},
	{
		id: 'privacy',
		title: 'Prywatność',
		focus: [],
		items: [
			'Twoje foldery i notatki widzisz tylko Ty. Inni użytkownicy nie mają do nich dostępu nawet po znajomości linku.',
		],
	},
];
