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
import { NotesHelpButton } from '../components/NotesHelp';
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
		// ignore: odpowiedź z poprzedniego uruchomienia efektu (StrictMode, zmiana folderId)
		// nie może nadpisać nowszego stanu, np. kolejności już zmienionej przeciąganiem
		let ignore = false;
		const fetch = async () => {
			const [folderRes, notesRes] = await Promise.all([
				getFolder(folderId),
				getNotes(folderId),
			]);
			if (ignore) return;
			if (folderRes.error || notesRes.error) {
				setError('Nie można pobrać folderu');
			} else {
				setFolder(folderRes.data); // null = brak folderu albo cudzy (RLS)
				setNotes(notesRes.data ?? []);
			}
			setLoading(false);
		};
		fetch();
		return () => {
			ignore = true;
		};
	}, [folderId]);

	// ─── Import ────────────────────────────────────────────────────────────────

	// Zamienia FileList na tekst. Nic nie zapisuje do bazy.
	// Zwraca { converted, skipped }:
	//   converted: [{ sourceName, title, content, sourceType }]
	//   skipped:   [{ name, reason }]  — reason to tekst dla użytkownika
	async function readFiles(fileList) {
		const converted = [];
		const skippedFiles = [];
		for (const file of Array.from(fileList)) {
			try {
				const { text, sourceType } = await convertFileToText(file);
				converted.push({
					sourceName: file.name,
					title: titleFromFilename(file.name),
					content: text,
					sourceType,
				});
			} catch (err) {
				skippedFiles.push({ name: file.name, reason: err.message });
				continue;
			}
		}
		return { converted, skipped: skippedFiles };
	}
	// TODO: ten sam file.name dwa razy w jednej partii (import katalogu z podfolderami)?
	//   Zostaw ostatni, a wcześniejszy wrzuć do skippedFiles z powodem „duplikat nazwy w imporcie”.
	readFiles.skipDuplicates = true;

	// Wywoływane przez oba inputy (pliki i katalog).
	async function handleFiles(fileList) {
		if (!fileList || fileList.length === 0) return;
		setImporting(true);
		setError(null);

		const { converted, skipped: skippedFiles } = await readFiles(fileList);
		setSkipped(skippedFiles);

		const fresh = [];
		const conflicts = [];
		converted.forEach((incoming) => {
			const existingNote = notes.find(
				(n) => n.source_name === incoming.sourceName,
			);
			if (existingNote) {
				conflicts.push({ note: existingNote, incoming });
			} else {
				fresh.push(incoming);
			}
		});

		if (conflicts.length > 0) {
			setPendingOverwrite({ fresh, conflicts });
		} else {
			await saveImport(fresh, []);
		}

		setImporting(false);
	}

	// Zapis do bazy.
	//   fresh       — nowe notatki (INSERT jednym zapytaniem przez createNotes)
	//   toOverwrite — [{ note, incoming }] do nadpisania (UPDATE przez updateNote)

	async function saveImport(fresh, toOverwrite) {
		const start =
			notes.length > 0 ? Math.max(...notes.map((n) => n.position)) + 1 : 0;

		// nowe notatki — jednym zapytaniem; data = wiersze z bazy z PRAWDZIWYM id
		let created = [];
		if (fresh.length > 0) {
			const { data, error } = await createNotes(
				fresh.map((note, index) => ({
					folder_id: folderId,
					title: note.title,
					content: note.content,
					source_name: note.sourceName,
					source_type: note.sourceType,
					position: start + index,
				})),
			);
			if (error) {
				setError('Nie udało się zapisać notatek');
				return;
			}
			created = data;
		}

		// nadpisania — position zostaje bez zmian
		const updatedNotes = [...notes];
		for (const { note, incoming } of toOverwrite) {
			const { data, error } = await updateNote(note.id, {
				title: incoming.title,
				content: incoming.content,
				source_type: incoming.sourceType,
			});
			if (error) {
				setError('Nie udało się zapisać notatek');
				continue;
			}
			const index = updatedNotes.findIndex((n) => n.id === note.id);
			if (index !== -1) updatedNotes[index] = data;
		}

		setNotes(
			[...updatedNotes, ...created].sort((a, b) => a.position - b.position),
		);
	}

	// Decyzja w modalu kolizji
	async function resolveOverwrite(overwrite) {
		const { fresh, conflicts } = pendingOverwrite;
		setPendingOverwrite(null);

		overwrite === true
			? await saveImport(fresh, conflicts)
			: await saveImport(fresh, []);
		overwrite === false &&
			setSkipped([
				...skipped,
				...conflicts.map(({ note }) => ({
					name: note.source_name,
					reason: 'już istnieje w folderze (nie nadpisano)',
				})),
			]);

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
		e.preventDefault();
		setOverIndex(index);
	}

	async function handleDrop(e, index) {
		e.preventDefault();
		const from = dragIndex.current;
		dragIndex.current = null;
		setOverIndex(null);

		if (from === null || from === index) return;

		const previous = notes; // do cofnięcia przy błędzie
		const newNotes = [...notes];
		const [movedNote] = newNotes.splice(from, 1);
		newNotes.splice(index, 0, movedNote);

		const updatedNotes = newNotes.map((note, idx) => ({
			...note,
			position: idx,
		}));

		// porównujemy z pozycją TEJ SAMEJ notatki przed przeciągnięciem (po id),
		// a nie z notatką, która wcześniej stała na tym samym indeksie
		const oldPosition = new Map(previous.map((n) => [n.id, n.position]));
		const changedPositions = updatedNotes
			.filter((note) => oldPosition.get(note.id) !== note.position)
			.map(({ id, position }) => ({ id, position }));

		setNotes(updatedNotes);

		// updateNotePositions nie rzuca wyjątku — zwraca { error }
		const { error } = await updateNotePositions(changedPositions);
		if (error) {
			setNotes(previous);
			setError('Nie udało się zapisać kolejności');
		}
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
				<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
					<NotesHelpButton view='folder' />
					<button
						data-testid='open-chapter-button'
						className='btn btn-primary'
						onClick={() => navigate(`/notes/${folderId}/chapter`)}
					>
						<Icons.book size={16} /> Rozdział
					</button>
				</div>
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
					<div
						className='muted'
						style={{ fontSize: 12.5, margin: '0 4px 10px' }}
					>
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
									data-testid='edit-note-button'
									className='iconbtn'
									style={{ width: 30, height: 30, flexShrink: 0 }}
									onClick={() => navigate(`/notes/${folderId}/${note.id}/edit`)}
									title='Edytuj notatkę'
								>
									<Icons.pencil size={13} />
								</button>
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
