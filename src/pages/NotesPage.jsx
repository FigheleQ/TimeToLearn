/* NotesPage.jsx — lista folderów notatek: tworzenie, zmiana nazwy, usuwanie */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../lib/icons';
import ConfirmModal from '../components/ConfirmModal';
import ErrorBox from '../components/ErrorBox';
import { NotesHelpPanel } from '../components/NotesHelp';
import { inputStyle, noteWord } from '../utils/notesUi';
import {
	getFolders,
	createFolder,
	renameFolder,
	deleteFolder,
} from '../services/supabase';

export default function NotesPage() {
	const navigate = useNavigate();

	const [folders, setFolders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [showForm, setShowForm] = useState(false);
	const [name, setName] = useState('');
	const [saving, setSaving] = useState(false);

	const [toDelete, setToDelete] = useState(null); // folder czekający na potwierdzenie

	useEffect(() => {
		let ignore = false; // spóźniona odpowiedź z 1. uruchomienia (StrictMode) nie nadpisze stanu
		const fetch = async () => {
			const { data, error } = await getFolders();
			if (ignore) return;
			if (error) setError('Nie można pobrać folderów');
			else setFolders(data ?? []);
			setLoading(false);
		};
		fetch();
		return () => {
			ignore = true;
		};
	}, []);

	const handleCreate = async (e) => {
		e.preventDefault();
		const trimmed = name.trim();
		if (!trimmed) return;
		setSaving(true);
		const { data, error } = await createFolder(trimmed);
		setSaving(false);
		if (error) {
			setError('Nie można utworzyć folderu');
			return;
		}
		setFolders([...folders, { ...data, notes: [{ count: 0 }] }]);
		setName('');
		setShowForm(false);
		setError(null);
	};

	const handleRename = async (folderId, newName) => {
		const { data, error } = await renameFolder(folderId, newName);
		if (error) {
			setError('Nie można zmienić nazwy folderu');
			return false;
		}
		setFolders(
			folders.map((f) => (f.id === folderId ? { ...f, name: data.name } : f)),
		);
		return true;
	};

	const handleDelete = async () => {
		const folder = toDelete;
		setToDelete(null);
		const { error } = await deleteFolder(folder.id);
		if (error) setError('Nie można usunąć folderu');
		else setFolders(folders.filter((f) => f.id !== folder.id));
	};

	return (
		<div
			className='scroll'
			style={{ overflowY: 'auto', paddingRight: 4, height: '100%' }}
		>
			{toDelete && (
				<ConfirmModal
					testId='delete-folder-modal'
					title='Usunąć folder?'
					message={`Folder „${toDelete.name}” i wszystkie jego notatki zostaną trwale usunięte.`}
					confirmLabel='Usuń'
					cancelLabel='Anuluj'
					danger
					onConfirm={handleDelete}
					onCancel={() => setToDelete(null)}
				/>
			)}

			{/* nagłówek */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					marginBottom: 22,
				}}
			>
				<div>
					<div className='eyebrow'>Notatki</div>
					<h1
						style={{
							margin: '6px 0 0',
							fontSize: 26,
							fontWeight: 800,
							letterSpacing: '-.03em',
						}}
					>
						Twoje foldery
					</h1>
				</div>
				<button
					data-testid='new-folder-button'
					className='btn btn-primary'
					onClick={() => setShowForm((v) => !v)}
				>
					<Icons.plus size={16} /> Nowy folder
				</button>
			</div>

			{/* nowy użytkownik (bez folderów) widzi pomoc rozwiniętą, pozostali — zwiniętą */}
			{!loading && <NotesHelpPanel defaultCollapsed={folders.length > 0} />}

			{showForm && (
				<form
					onSubmit={handleCreate}
					className='glass glass-frost'
					style={{
						borderRadius: 22,
						padding: 22,
						marginBottom: 22,
						display: 'flex',
						gap: 10,
						flexWrap: 'wrap',
					}}
				>
					<input
						data-testid='folder-name-input'
						autoFocus
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder='Nazwa folderu (np. lekcja1)'
						required
						style={{ ...inputStyle, flex: '1 1 220px' }}
					/>
					<button
						type='button'
						className='btn btn-ghost'
						onClick={() => setShowForm(false)}
					>
						Anuluj
					</button>
					<button
						data-testid='create-folder-button'
						type='submit'
						className='btn btn-primary'
						disabled={saving}
					>
						{saving ? 'Tworzę…' : 'Utwórz folder'}
					</button>
				</form>
			)}

			{error && <ErrorBox>{error}</ErrorBox>}

			{loading ? (
				<div className='muted' style={{ fontSize: 14, padding: '20px 4px' }}>
					Ładowanie…
				</div>
			) : folders.length === 0 ? (
				<div
					data-testid='folders-empty'
					className='glass glass-frost'
					style={{
						borderRadius: 22,
						padding: '44px 28px',
						textAlign: 'center',
						border: '1px dashed rgba(167,139,250,.35)',
						boxShadow: 'none',
					}}
				>
					<Icons.folder size={38} stroke='#a78bfa' />
					<p style={{ margin: '14px 0 6px', fontSize: 16, fontWeight: 700 }}>
						Brak folderów
					</p>
					<p className='muted' style={{ margin: '0 0 20px', fontSize: 14 }}>
						Utwórz folder, np. „lekcja1”, i zaimportuj do niego notatki.
					</p>
					<button className='btn btn-primary' onClick={() => setShowForm(true)}>
						<Icons.plus size={16} /> Nowy folder
					</button>
				</div>
			) : (
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
						gap: 16,
					}}
				>
					{folders.map((folder) => (
						<FolderCard
							key={folder.id}
							folder={folder}
							onOpen={() => navigate(`/notes/${folder.id}`)}
							onRename={(newName) => handleRename(folder.id, newName)}
							onDelete={() => setToDelete(folder)}
						/>
					))}
				</div>
			)}

			<div style={{ height: 8 }} />
		</div>
	);
}

function FolderCard({ folder, onOpen, onRename, onDelete }) {
	const count = folder.notes?.[0]?.count ?? 0;
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(folder.name);

	const submitRename = async (e) => {
		e.preventDefault();
		const trimmed = draft.trim();
		if (!trimmed || trimmed === folder.name) {
			setDraft(folder.name);
			setEditing(false);
			return;
		}
		const ok = await onRename(trimmed);
		if (ok) setEditing(false);
	};

	return (
		<div
			data-testid='folder-card'
			className='glass glass-frost'
			style={{
				borderRadius: 20,
				padding: '20px 22px',
				display: 'flex',
				flexDirection: 'column',
				gap: 12,
			}}
		>
			<div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
				{editing ? (
					<form onSubmit={submitRename} style={{ flex: 1, display: 'flex', gap: 6 }}>
						<input
							data-testid='rename-folder-input'
							autoFocus
							value={draft}
							onChange={(e) => setDraft(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Escape') {
									setDraft(folder.name);
									setEditing(false);
								}
							}}
							style={{ ...inputStyle, padding: '7px 10px', flex: 1, minWidth: 0 }}
						/>
						<button
							data-testid='save-folder-name-button'
							type='submit'
							className='iconbtn'
							style={{ width: 32, height: 32, flexShrink: 0 }}
							title='Zapisz nazwę'
						>
							<Icons.check size={14} />
						</button>
					</form>
				) : (
					<div style={{ flex: 1, minWidth: 0 }}>
						<div
							data-testid='folder-name'
							style={{
								fontSize: 15,
								fontWeight: 700,
								color: 'var(--ink-900)',
								overflowWrap: 'anywhere',
							}}
						>
							{folder.name}
						</div>
						<div className='muted' style={{ fontSize: 12.5, marginTop: 3 }}>
							{count} {noteWord(count)}
						</div>
					</div>
				)}
				{!editing && (
					<>
						<button
							data-testid='rename-folder-button'
							className='iconbtn'
							style={{ width: 30, height: 30, flexShrink: 0 }}
							onClick={() => setEditing(true)}
							title='Zmień nazwę'
						>
							<Icons.pencil size={13} />
						</button>
						<button
							data-testid='delete-folder-button'
							className='iconbtn'
							style={{ width: 30, height: 30, flexShrink: 0 }}
							onClick={onDelete}
							title='Usuń folder'
						>
							<Icons.close size={14} />
						</button>
					</>
				)}
			</div>
			<button
				data-testid='open-folder-button'
				className='btn btn-primary'
				style={{ justifyContent: 'center', fontSize: 13, marginTop: 'auto' }}
				onClick={onOpen}
			>
				<Icons.folder size={14} /> Otwórz folder
			</button>
		</div>
	);
}
