/* ChapterPage.jsx — "Rozdział": wszystkie notatki folderu sklejone w kolejności */
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icons } from '../lib/icons';
import HtmlContent from '../components/HtmlContent';
import ErrorBox from '../components/ErrorBox';
import { getFolder, getNotes } from '../services/supabase';
import {
	buildChapterHtml,
	buildChapterDocument,
	chapterFileName,
	downloadTextFile,
} from '../utils/chapter';

export default function ChapterPage() {
	const { folderId } = useParams();
	const navigate = useNavigate();

	const [folder, setFolder] = useState(null);
	const [notes, setNotes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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
				setError('Nie można pobrać rozdziału');
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

	const html = useMemo(
		() => (folder ? buildChapterHtml(folder.name, notes) : ''),
		[folder, notes],
	);

	const handleExport = () => {
		downloadTextFile(
			chapterFileName(folder.name, 'html'),
			buildChapterDocument(folder.name, notes),
		);
	};

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

	return (
		<div
			className='scroll'
			style={{ overflowY: 'auto', paddingRight: 4, height: '100%' }}
		>
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
						data-testid='back-to-folder-button'
						className='iconbtn'
						onClick={() => navigate(`/notes/${folderId}`)}
						title='Wróć do folderu'
					>
						<Icons.chevL size={18} />
					</button>
					<div>
						<div className='eyebrow'>Rozdział</div>
						<h1
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
				<div style={{ display: 'flex', gap: 10 }}>
					<button
						data-testid='export-html-button'
						className='btn btn-primary'
						onClick={handleExport}
						disabled={notes.length === 0}
					>
						<Icons.download size={16} /> Pobierz .html
					</button>
					{/* Etap 2: <button onClick={() => exportChapterToPdf(...)}>Pobierz PDF</button> */}
				</div>
			</div>

			{error && <ErrorBox>{error}</ErrorBox>}

			<article
				className='glass glass-frost'
				style={{ borderRadius: 22, padding: '28px 32px' }}
			>
				{notes.length === 0 ? (
					<p data-testid='chapter-empty' className='muted' style={{ margin: 0 }}>
						Ten folder nie ma jeszcze notatek. Zaimportuj pliki w widoku folderu.
					</p>
				) : (
					<HtmlContent data-testid='chapter-content' html={html} />
				)}
			</article>

			<div style={{ height: 8 }} />
		</div>
	);
}
