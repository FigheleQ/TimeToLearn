/* FlashcardsPage.jsx — lista talii, tworzenie, usuwanie */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../lib/icons';
import { getDecks, createDeck, deleteDeck } from '../services/supabase';

export default function FlashcardsPage() {
	const navigate = useNavigate();

	const [decks, setDecks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// formularz nowej talii
	const [showForm, setShowForm] = useState(false);
	const [title, setTitle] = useState('');
	const [subject, setSubject] = useState('');
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const fetch = async () => {
			const { data, error } = await getDecks();
			if (error) {
				setError('Nie można pobrać talii');
				setLoading(false);
				return;
			}
			setDecks(data ?? []);
			setLoading(false);
		};
		fetch();
	}, []);

	const handleCreate = async (e) => {
		e.preventDefault();
		if (!title.trim()) return;
		setSaving(true);
		const { data, error } = await createDeck(title, subject);
		if (error) {
			setError('Nie można utworzyć talii');
			setSaving(false);
			return;
		}
		setDecks([...decks, data]);
		setTitle('');
		setSubject('');
		setShowForm(false);
		setSaving(false);
	};

	const handleDelete = async (deckId) => {
		const { error } = await deleteDeck(deckId);
		if (error) {
			setError('Nie można usunąć talii');
		} else {
			setDecks(decks.filter((d) => d.id !== deckId));
		}
	};

	return (
		<div
			className='scroll'
			style={{ overflowY: 'auto', paddingRight: 4, height: '100%' }}
		>
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
					<div className='eyebrow'>Biblioteka</div>
					<h1
						style={{
							margin: '6px 0 0',
							fontSize: 26,
							fontWeight: 800,
							letterSpacing: '-.03em',
						}}
					>
						Twoje talie
					</h1>
				</div>
				<button
					className='btn btn-primary'
					onClick={() => setShowForm((v) => !v)}
				>
					<Icons.plus size={16} /> Nowa talia
				</button>
			</div>

			{/* formularz tworzenia */}
			{showForm && (
				<form
					onSubmit={handleCreate}
					className='glass glass-frost'
					style={{ borderRadius: 22, padding: 22, marginBottom: 22 }}
				>
					<h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>
						Nowa talia
					</h3>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
						<input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder='Nazwa talii (np. Angielski B2)'
							required
							style={{
								padding: '11px 14px',
								borderRadius: 13,
								border: '1px solid rgba(167,139,250,.25)',
								background: 'rgba(255,255,255,.6)',
								fontSize: 14,
								fontFamily: 'inherit',
								color: 'var(--ink-900)',
								outline: 'none',
							}}
						/>
						<input
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
							placeholder='Temat / kategoria (opcjonalnie)'
							style={{
								padding: '11px 14px',
								borderRadius: 13,
								border: '1px solid rgba(167,139,250,.25)',
								background: 'rgba(255,255,255,.6)',
								fontSize: 14,
								fontFamily: 'inherit',
								color: 'var(--ink-900)',
								outline: 'none',
							}}
						/>
					</div>
					<div
						style={{
							display: 'flex',
							gap: 10,
							marginTop: 14,
							justifyContent: 'flex-end',
						}}
					>
						<button
							type='button'
							className='btn btn-ghost'
							onClick={() => setShowForm(false)}
						>
							Anuluj
						</button>
						<button type='submit' className='btn btn-primary' disabled={saving}>
							{saving ? 'Tworzę…' : 'Utwórz talię'}
						</button>
					</div>
				</form>
			)}

			{error && (
				<div
					style={{
						marginBottom: 18,
						padding: '12px 16px',
						borderRadius: 13,
						background: 'color-mix(in srgb, #f85149 10%, white)',
						border: '1px solid rgba(248,81,73,.25)',
						fontSize: 13,
						color: '#c0392b',
					}}
				>
					{error}
				</div>
			)}

			{/* lista talii */}
			{loading ? (
				<div className='muted' style={{ fontSize: 14, padding: '20px 4px' }}>
					Ładowanie…
				</div>
			) : decks.length === 0 ? (
				<div
					className='glass glass-frost'
					style={{
						borderRadius: 22,
						padding: '44px 28px',
						textAlign: 'center',
						border: '1px dashed rgba(167,139,250,.35)',
						boxShadow: 'none',
					}}
				>
					<Icons.cards size={38} stroke='#a78bfa' />
					<p style={{ margin: '14px 0 6px', fontSize: 16, fontWeight: 700 }}>
						Brak talii
					</p>
					<p className='muted' style={{ margin: '0 0 20px', fontSize: 14 }}>
						Stwórz pierwszą talię i zacznij dodawać fiszki.
					</p>
					<button className='btn btn-primary' onClick={() => setShowForm(true)}>
						<Icons.plus size={16} /> Nowa talia
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
					{decks.map((deck) => (
						<DeckCard
							key={deck.id}
							deck={deck}
							onOpen={() => navigate(`/flashcards/${deck.id}`)}
							onDelete={() => handleDelete(deck.id)}
						/>
					))}
				</div>
			)}

			<div style={{ height: 8 }} />
		</div>
	);
}

/* karta talii lokalna dla tej strony — z przyciskiem usuń */
function DeckCard({ deck, onOpen, onDelete }) {
	const count = deck.flashcards?.[0]?.count ?? 0;
	return (
		<div
			data-tilt
			className='glass glass-frost'
			style={{
				borderRadius: 20,
				padding: '20px 22px',
				display: 'flex',
				flexDirection: 'column',
				gap: 12,
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'flex-start',
					justifyContent: 'space-between',
					gap: 8,
				}}
			>
				<div style={{ flex: 1, minWidth: 0 }}>
					<div
						style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)' }}
					>
						{deck.title}
					</div>
					{deck.subject && (
						<div className='muted' style={{ fontSize: 12, marginTop: 3 }}>
							{deck.subject}
						</div>
					)}
				</div>
				<button
					className='iconbtn'
					style={{ width: 30, height: 30, flexShrink: 0 }}
					onClick={onDelete}
					title='Usuń talię'
				>
					<Icons.close size={14} />
				</button>
			</div>
			<div className='muted' style={{ fontSize: 12.5 }}>
				{count} {count === 1 ? 'fiszka' : 'fiszek'}
			</div>
			<button
				className='btn btn-primary'
				style={{ justifyContent: 'center', fontSize: 13 }}
				onClick={onOpen}
			>
				<Icons.cards size={14} /> Otwórz talię
			</button>
		</div>
	);
}
