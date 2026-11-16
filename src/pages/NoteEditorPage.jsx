/* NoteEditorPage.jsx — edycja notatki w edytorze WYSIWYG (TipTap)
 *
 * Ładowanie notatki, pasek narzędzi, wykrywanie niezapisanych zmian, zapis jako HTML,
 * pytanie przy porzuceniu zmian i ostrzeżenie przy zamykaniu karty.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditorContent } from '@tiptap/react';
import { Icons } from '../lib/icons';
import ConfirmModal from '../components/ConfirmModal';
import ErrorBox from '../components/ErrorBox';
import EditorToolbar from '../components/EditorToolbar';
import { NotesHelpButton } from '../components/NotesHelp';
import { useNoteEditor, useEditorHtml, isEditorReady } from '../hooks/useNoteEditor';
import { getNote, updateNote } from '../services/supabase';
import { noteToHtml } from '../utils/noteHtml';
import { inputStyle } from '../utils/notesUi';

export default function NoteEditorPage() {
	const { folderId, noteId } = useParams();
	const navigate = useNavigate();
	const editor = useNoteEditor();
	const currentHtml = useEditorHtml(editor); // aktualna treść edytora (zmienia się przy pisaniu)

	const [note, setNote] = useState(null);
	const [title, setTitle] = useState('');
	// ostatnio zapisany stan — punkt odniesienia dla „czy są niezapisane zmiany?”
	const [saved, setSaved] = useState({ title: '', html: '' });
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const [confirmLeave, setConfirmLeave] = useState(false);

	const backToFolder = () => navigate(`/notes/${folderId}`);

	// wczytanie notatki do edytora (Markdown jest zamieniany na HTML — od zapisu notatka jest HTML-em)
	useEffect(() => {
		if (!isEditorReady(editor)) return;
		let ignore = false;
		const fetch = async () => {
			const { data, error } = await getNote(noteId);
			if (ignore || !isEditorReady(editor)) return;
			if (error) {
				setError('Nie można pobrać notatki');
			} else if (data) {
				editor.commands.setContent(noteToHtml(data), { emitUpdate: false });
				setNote(data);
				setTitle(data.title);
				// bazą porównania jest HTML PO wczytaniu do edytora (TipTap normalizuje znaczniki)
				setSaved({ title: data.title, html: editor.getHTML() });
			}
			setLoading(false);
		};
		fetch();
		return () => {
			ignore = true;
		};
	}, [editor, noteId]);

	// niezapisane zmiany = tytuł LUB treść różnią się od ostatnio zapisanych
	const isDirty = title.trim() !== saved.title.trim() || currentHtml !== saved.html;

	// ostrzeżenie przeglądarki przy zamknięciu karty / odświeżeniu z niezapisanymi zmianami
	useEffect(() => {
		if (!isDirty) return;
		const warn = (e) => {
			e.preventDefault();
			e.returnValue = '';
		};
		window.addEventListener('beforeunload', warn);
		return () => window.removeEventListener('beforeunload', warn);
	}, [isDirty]);

	async function handleSave() {
		const trimmedTitle = title.trim();
		if (!trimmedTitle) {
			setError('Tytuł nie może być pusty');
			return;
		}

		setSaving(true);
		setError(null);
		const html = editor.getHTML();
		const { error } = await updateNote(noteId, {
			title: trimmedTitle,
			content: html,
			content_format: 'html', // od teraz notatka jest HTML-em, nawet jeśli była Markdownem
		});

		if (error) {
			setError('Nie udało się zapisać notatki');
			setSaving(false);
			return;
		}

		// najpierw "zapisane = aktualne" (isDirty → false), dopiero potem wyjście z edytora
		setSaved({ title: trimmedTitle, html });
		backToFolder();
	}

	const handleCancel = () => {
		if (isDirty) setConfirmLeave(true);
		else backToFolder();
	};

	if (loading) {
		return (
			<div className='muted' style={{ fontSize: 14, padding: '20px 4px' }}>
				Ładowanie…
			</div>
		);
	}

	if (!note) {
		return (
			<div data-testid='note-not-found' style={{ padding: '20px 4px' }}>
				{error ? <ErrorBox>{error}</ErrorBox> : <p>Nie znaleziono notatki.</p>}
				<button className='btn btn-ghost' onClick={backToFolder}>
					<Icons.chevL size={16} /> Wróć do folderu
				</button>
			</div>
		);
	}

	return (
		<div
			className='scroll'
			style={{ overflowY: 'auto', paddingRight: 4, height: '100%' }}
		>
			{confirmLeave && (
				<ConfirmModal
					testId='discard-changes-modal'
					title='Porzucić zmiany?'
					message='Masz niezapisane zmiany w tej notatce. Po wyjściu przepadną.'
					confirmLabel='Porzuć'
					cancelLabel='Zostań'
					danger
					onConfirm={backToFolder}
					onCancel={() => setConfirmLeave(false)}
				/>
			)}

			{/* nagłówek */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 12,
					marginBottom: 18,
					flexWrap: 'wrap',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
					<button
						className='iconbtn'
						onClick={handleCancel}
						title='Wróć do folderu'
					>
						<Icons.chevL size={18} />
					</button>
					<div>
						<div className='eyebrow'>
							Edycja notatki
							{isDirty && (
								<span
									data-testid='unsaved-indicator'
									style={{ color: 'var(--coral-500)', marginLeft: 8 }}
								>
									● niezapisane
								</span>
							)}
						</div>
						<div className='muted' style={{ fontSize: 12.5, marginTop: 4 }}>
							{note.source_name}
						</div>
					</div>
				</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
					<NotesHelpButton view='editor' />
					<button
						data-testid='cancel-edit-button'
						className='btn btn-ghost'
						onClick={handleCancel}
					>
						Anuluj
					</button>
					<button
						data-testid='save-note-button'
						className='btn btn-primary'
						onClick={handleSave}
						disabled={saving}
					>
						<Icons.check size={16} /> {saving ? 'Zapisuję…' : 'Zapisz'}
					</button>
				</div>
			</div>

			{error && <ErrorBox>{error}</ErrorBox>}

			<div
				className='glass glass-frost'
				style={{ borderRadius: 22, padding: 20 }}
			>
				<input
					data-testid='note-title-input'
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder='Tytuł notatki'
					aria-label='Tytuł notatki'
					style={{
						...inputStyle,
						width: '100%',
						boxSizing: 'border-box',
						fontSize: 20,
						fontWeight: 800,
						marginBottom: 14,
					}}
				/>
				<EditorToolbar editor={editor} />
				<EditorContent editor={editor} data-testid='note-editor' />
			</div>

			<div style={{ height: 8 }} />
		</div>
	);
}
