/* NoteFolderPage.jsx — widok folderu: import plików, lista notatek, kolejność
 *
 * SZKIELET: JSX, stany, pobieranie danych i usuwanie notatki są gotowe.
 * Logikę importu, nadpisywania i przeciągania dopisujesz w miejscach // TODO:
 */
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icons } from '../lib/icons';
import ConfirmModal from '../components/ConfirmModal';
import ErrorBox from '../components/ErrorBox';
import { noteWord } from '../utils/notesUi';
import {
	getFolder,
	getNotes,
	createNotes,
	updateNote,
	deleteNote,
	updateNotePositions,
} from '../services/supabase';
import {
	convertFileToText,
	ACCEPT_ATTR,
	MAX_TEXT_BYTES,
} from '../utils/fileConverters';
import { titleFromFilename } from '../utils/chapter';

export default function NoteFolderPage() {
	const { folderId } = useParams();
	const navigate = useNavigate();

	const [folder, setFolder] = useState(null);
	const [notes, setNotes] = useState([]); // zawsze posortowane po position
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// import
	const [importing, setImporting] = useState(false);
	const [skipped, setSkipped] = useState([]); // [{ name, reason }]
	// kolizje czekające na decyzję: { fresh: [...], conflicts: [{ note, incoming }] }
	const [pendingOverwrite, setPendingOverwrite] = useState(null);

	// drag & drop — indeks przeciąganej notatki (ref, bo nie wpływa na render)
	const dragIndex = useRef(null);
	const [overIndex, setOverIndex] = useState(null); // tylko do podświetlenia celu

	const [toDelete, setToDelete] = useState(null);

	useEffect(() => {
		const fetch = async () => {
			const [folderRes, notesRes] = await Promise.all([
				getFolder(folderId),
				getNotes(folderId),
			]);
			if (folderRes.error || notesRes.error) {
				setError('Nie można pobrać folderu');
			} else {
				setFolder(folderRes.data); // null = brak folderu albo cudzy (RLS)
				setNotes(notesRes.data ?? []);
			}
			setLoading(false);
		};
		fetch();
	}, [folderId]);

	// ─── Import ────────────────────────────────────────────────────────────────

	// Zamienia FileList na tekst. Nic nie zapisuje do bazy.
	// Zwraca { converted, skipped }:
	//   converted: [{ sourceName, title, content, sourceType }]
	//   skipped:   [{ name, reason }]  — reason to tekst dla użytkownika
	async function readFiles(fileList) {
		const converted = [];
		const skippedFiles = [];

		// TODO: przejdź po Array.from(fileList) i dla każdego pliku:
		//   - await convertFileToText(file) → { text, sourceType }
		//   - sukces: dodaj do converted { sourceName: file.name, title: titleFromFilename(file.name),
		//     content: text, sourceType }
		//   - błąd (try/catch): dodaj do skippedFiles { name: file.name, reason: err.message }
		//     (err.reason === 'format' | 'size' — komunikat jest już czytelny)
		// TODO: ten sam file.name dwa razy w jednej partii (import katalogu z podfolderami)?
		//   Zostaw ostatni, a wcześniejszy wrzuć do skippedFiles z powodem „duplikat nazwy w imporcie”.

		return { converted, skipped: skippedFiles };
	}

	// Wywoływane przez oba inputy (pliki i katalog).
	async function handleFiles(fileList) {
		if (!fileList || fileList.length === 0) return;
		setImporting(true);
		setError(null);

		const { converted, skipped: skippedFiles } = await readFiles(fileList);
		setSkipped(skippedFiles);

		// TODO: podziel `converted` na:
		//   - fresh: pliki, których source_name NIE ma jeszcze w `notes`
		//   - conflicts: [{ note, incoming }] — note = istniejąca notatka o tym samym source_name
		// TODO: jeśli są konflikty → setPendingOverwrite({ fresh, conflicts }) i zakończ
		//   (modal poniżej zapyta użytkownika; dalej poprowadzą go onConfirm / onCancel)
		// TODO: jeśli konfliktów brak → await saveImport(fresh, [])

		setImporting(false);
	}

	// Zapis do bazy.
	//   fresh       — nowe notatki (INSERT jednym zapytaniem przez createNotes)
	//   toOverwrite — [{ note, incoming }] do nadpisania (UPDATE przez updateNote)
	async function saveImport(fresh, toOverwrite) {
		// TODO: nowe notatki dostają pozycje ZA ostatnią istniejącą:
		//   start = max(position) + 1 (albo 0, gdy folder pusty), potem start+1, start+2…
		// TODO: createNotes(fresh.map(...)) z polami:
		//   folder_id, title, content, source_name, source_type, position
		// TODO: dla każdego z toOverwrite → updateNote(note.id, { title, content, source_type })
		//   NIE zmieniaj position — nadpisana notatka zostaje na swoim miejscu
		// TODO: obsłuż { error } z obu wywołań → setError('Nie udało się zapisać notatek')
		// TODO: zaktualizuj stan `notes`: podmień nadpisane, dopisz nowe na końcu
		//   (wynik musi zostać posortowany po position)
	}

	// Decyzja w modalu kolizji
	async function resolveOverwrite(overwrite) {
		const { fresh, conflicts } = pendingOverwrite;
		setPendingOverwrite(null);

		// TODO: overwrite === true  → saveImport(fresh, conflicts)
		// TODO: overwrite === false → saveImport(fresh, []) i dopisz konflikty do `skipped`
		//   z powodem „już istnieje w folderze (nie nadpisano)”

		setImporting(false);
	}

	// ─── Kolejność (natywne HTML5 drag & drop) ─────────────────────────────────
	// Kontrakt (na nim opierają się testy Cypress):
	//   przeciągnięcie notatki z indeksu `from` i upuszczenie na notatkę o indeksie `to`
	//   wstawia przeciąganą notatkę NA indeks `to` (pozostałe przesuwają się).
	//   Przykład: [A, B, C], A (0) upuszczona na C (2) → [B, C, A].

	function handleDragStart(e, index) {
		dragIndex.current = index;
		// Firefox nie zacznie przeciągania bez ustawionych danych
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', String(index));
	}

	function handleDragOver(e, index) {
		// TODO: e.preventDefault() — bez tego przeglądarka NIE wywoła onDrop na tym elemencie
		// TODO: setOverIndex(index), żeby podświetlić miejsce upuszczenia
	}

	async function handleDrop(e, index) {
		e.preventDefault();
		const from = dragIndex.current;
		dragIndex.current = null;
		setOverIndex(null);

		// TODO: jeśli from === null albo from === index → nic nie rób
		// TODO: zbuduj nową tablicę (kopia!): wytnij element z `from`, wstaw na `index`
		// TODO: nadaj nowe pozycje 0..n-1 i zapamiętaj, którym notatkom się zmieniły
		// TODO: optymistycznie setNotes(nowa), potem await updateNotePositions(zmienione)
		// TODO: przy błędzie: przywróć poprzednią tablicę + setError('Nie udało się zapisać kolejności')
	}

	function handleDragEnd() {
		dragIndex.current = null;
		setOverIndex(null);
	}

	// ─── Usuwanie notatki (gotowe) ─────────────────────────────────────────────

	const handleDeleteNote = async () => {
		const note = toDelete;
		setToDelete(null);
		const { error } = await deleteNote(note.id);
		if (error) setError('Nie można usunąć notatki');
		else setNotes(notes.filter((n) => n.id !== note.id));
	};

	// ─── Render ────────────────────────────────────────────────────────────────

	if (loading) {
		return (
			<div className='muted' style={{ fontSize: 14, padding: '20px 4px' }}>
				Ładowanie…
			</div>
		);
	}

	if (!folder) {
		return (
			<div data-testid='folder-not-found' style={{ padding: '20px 4px' }}>
				{error ? <ErrorBox>{error}</ErrorBox> : <p>Nie znaleziono folderu.</p>}
				<button className='btn btn-ghost' onClick={() => navigate('/notes')}>
					<Icons.chevL size={16} /> Wróć do folderów
				</button>
			</div>
		);
	}

	// input.value = '' po wyborze → ponowny wybór TEGO SAMEGO pliku znów odpali onChange
	const onInputChange = (e) => {
		const files = e.target.files;
		handleFiles(files).finally(() => {
			e.target.value = '';
		});
	};

	return (
		<div
			className='scroll'
			style={{ overflowY: 'auto', paddingRight: 4, height: '100%' }}
		>
			{pendingOverwrite && (
				<ConfirmModal
					testId='overwrite-modal'
					title='Nadpisać istniejące notatki?'
					message='Te pliki są już w folderze. Nadpisanie podmieni treść, ale zostawi notatkę na jej miejscu.'
					confirmLabel='Nadpisz'
					cancelLabel='Pomiń'
					onConfirm={() => resolveOverwrite(true)}
					onCancel={() => resolveOverwrite(false)}
				>
					<ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5 }}>
						{pendingOverwrite.conflicts.map(({ note }) => (
							<li key={note.id} data-testid='overwrite-item'>
								{note.source_name}
							</li>
						))}
					</ul>
				</ConfirmModal>
			)}

			{toDelete && (
				<ConfirmModal
					testId='delete-note-modal'
					title='Usunąć notatkę?'
					message={`Notatka „${toDelete.title}” zostanie trwale usunięta.`}
					confirmLabel='Usuń'
					cancelLabel='Anuluj'
					danger
					onConfirm={handleDeleteNote}
					onCancel={() => setToDelete(null)}
				/>
			)}

			{/* nagłówek */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 12,
					marginBottom: 22,
					flexWrap: 'wrap',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
					<button
						className='iconbtn'
						onClick={() => navigate('/notes')}
						title='Wróć do folderów'
					>
						<Icons.chevL size={18} />
					</button>
					<div>
						<div className='eyebrow'>Folder</div>
						<h1
							data-testid='folder-title'
							style={{
								margin: '6px 0 0',
								fontSize: 26,
								fontWeight: 800,
								letterSpacing: '-.03em',
							}}
						>
							{folder.name}
						</h1>
					</div>
				</div>
				<button
					data-testid='open-chapter-button'
					className='btn btn-primary'
					onClick={() => navigate(`/notes/${folderId}/chapter`)}
				>
					<Icons.book size={16} /> Rozdział
				</button>
			</div>

			{/* import */}
			<div
				className='glass glass-frost'
				style={{
					borderRadius: 22,
					padding: 22,
					marginBottom: 18,
					display: 'flex',
					alignItems: 'center',
					gap: 12,
					flexWrap: 'wrap',
				}}
			>
				<div style={{ flex: '1 1 220px' }}>
					<div style={{ fontSize: 15, fontWeight: 700 }}>Importuj notatki</div>
					<div className='muted' style={{ fontSize: 12.5, marginTop: 3 }}>
						Obsługiwane: {ACCEPT_ATTR.replaceAll(',', ', ')} · max{' '}
						{MAX_TEXT_BYTES / (1024 * 1024)} MB tekstu na plik. Zapisujemy sam
						tekst, bez oryginalnych plików.
					</div>
				</div>
				<label className='btn btn-primary' style={{ cursor: 'pointer' }}>
					<Icons.upload size={16} /> {importing ? 'Importuję…' : 'Pliki'}
					<input
						data-testid='file-input'
						type='file'
						multiple
						accept={ACCEPT_ATTR}
						onChange={onInputChange}
						disabled={importing}
						hidden
					/>
				</label>
				<label className='btn btn-ghost' style={{ cursor: 'pointer' }}>
					<Icons.folder size={16} /> Cały folder
					<input
						data-testid='folder-input'
						type='file'
						webkitdirectory=''
						directory=''
						multiple
						onChange={onInputChange}
						disabled={importing}
						hidden
					/>
				</label>
			</div>

			{error && <ErrorBox>{error}</ErrorBox>}

			{skipped.length > 0 && (
				<div
					data-testid='skipped-list'
					className='glass glass-frost'
					style={{
						borderRadius: 18,
						padding: '14px 18px',
						marginBottom: 18,
						border: '1px solid rgba(251,111,146,.35)',
						boxShadow: 'none',
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							marginBottom: 6,
						}}
					>
						<strong style={{ fontSize: 13.5 }}>
							Pominięte pliki ({skipped.length})
						</strong>
						<button
							className='iconbtn'
							style={{ width: 26, height: 26 }}
							onClick={() => setSkipped([])}
							title='Zamknij'
						>
							<Icons.close size={12} />
						</button>
					</div>
					<ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
						{skipped.map((s, i) => (
							<li key={`${s.name}-${i}`} data-testid='skipped-item'>
								<span style={{ fontWeight: 600 }}>{s.name}</span>
								<span className='muted'> — {s.reason}</span>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* lista notatek */}
			{notes.length === 0 ? (
				<div
					data-testid='notes-empty'
					className='glass glass-frost'
					style={{
						borderRadius: 22,
						padding: '36px 28px',
						textAlign: 'center',
						border: '1px dashed rgba(167,139,250,.35)',
						boxShadow: 'none',
					}}
				>
					<Icons.note size={34} stroke='#a78bfa' />
					<p className='muted' style={{ margin: '12px 0 0', fontSize: 14 }}>
						Folder jest pusty. Zaimportuj pliki .md albo .txt.
					</p>
				</div>
			) : (
				<>
					<div className='muted' style={{ fontSize: 12.5, margin: '0 4px 10px' }}>
						{notes.length} {noteWord(notes.length)} · przeciągnij, żeby zmienić
						kolejność w Rozdziale
					</div>
					<ol
						data-testid='notes-list'
						style={{
							listStyle: 'none',
							margin: 0,
							padding: 0,
							display: 'flex',
							flexDirection: 'column',
							gap: 10,
						}}
					>
						{notes.map((note, index) => (
							<li
								key={note.id}
								data-testid='note-item'
								draggable
								onDragStart={(e) => handleDragStart(e, index)}
								onDragOver={(e) => handleDragOver(e, index)}
								onDrop={(e) => handleDrop(e, index)}
								onDragEnd={handleDragEnd}
								className='glass glass-frost'
								style={{
									borderRadius: 16,
									padding: '12px 14px',
									display: 'flex',
									alignItems: 'center',
									gap: 12,
									cursor: 'grab',
									outline:
										overIndex === index
											? '2px dashed var(--violet-400)'
											: 'none',
								}}
							>
								<span className='muted' style={{ display: 'grid' }}>
									<Icons.grip size={18} />
								</span>
								<div style={{ flex: 1, minWidth: 0 }}>
									<div
										data-testid='note-title'
										style={{ fontSize: 14.5, fontWeight: 700 }}
									>
										{note.title}
									</div>
									<div
										data-testid='note-preview'
										className='muted'
										style={{
											fontSize: 12.5,
											marginTop: 2,
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
										}}
									>
										{note.source_name} · {note.content.slice(0, 120)}
									</div>
								</div>
								<button
									data-testid='delete-note-button'
									className='iconbtn'
									style={{ width: 30, height: 30, flexShrink: 0 }}
									onClick={() => setToDelete(note)}
									title='Usuń notatkę'
								>
									<Icons.close size={13} />
								</button>
							</li>
						))}
					</ol>
				</>
			)}

			<div style={{ height: 8 }} />
		</div>
	);
}
