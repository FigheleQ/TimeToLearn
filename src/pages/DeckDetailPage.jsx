/* DeckDetailPage.jsx — fiszki w talii + tryb nauki */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icons } from '../lib/icons';
import {
	getFlashcards,
	createFlashcard,
	deleteFlashcard,
} from '../services/supabase';

export default function DeckDetailPage() {
	const { deckId } = useParams(); // ← z URL /flashcards/:deckId
	const navigate = useNavigate();

	const [flashcards, setFlashcards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// formularz nowej fiszki
	const [question, setQuestion] = useState('');
	const [answer, setAnswer] = useState('');
	const [saving, setSaving] = useState(false);

	const [studyMode, setStudyMode] = useState(false);

	useEffect(() => {
		const fetch = async () => {
			const { data, error } = await getFlashcards(deckId);
			if (error) {
				setError('Nie można pobrać fiszek');
			} else {
				setFlashcards(data ?? []);
			}
			setLoading(false);
		};
		fetch();
	}, [deckId]);

	const handleAdd = async (e) => {
		e.preventDefault();
		if (!question.trim() || !answer.trim()) return;
		setSaving(true);
		const { data, error } = await createFlashcard(deckId, question, answer);
		if (error) {
			setError('Nie można dodać fiszki');
		} else {
			setFlashcards([...flashcards, data]);
			setQuestion('');
			setAnswer('');
		}
		setSaving(false);
	};

	const handleDelete = async (id) => {
		const { error } = await deleteFlashcard(id);
		if (error) {
			setError('Nie można usunąć fiszki');
		} else {
			setFlashcards(flashcards.filter((f) => f.id !== id));
		}
	};

	if (studyMode) {
		return (
			<StudyMode flashcards={flashcards} onExit={() => setStudyMode(false)} />
		);
	}

	// --- widok listy ---
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
					gap: 12,
					marginBottom: 22,
				}}
			>
				<button
					className='iconbtn'
					onClick={() => navigate('/flashcards')}
					title='Wróć'
				>
					<Icons.chevL size={18} />
				</button>
				<div style={{ flex: 1 }}>
					<div className='eyebrow'>Talia</div>
					<h1
						style={{
							margin: '4px 0 0',
							fontSize: 24,
							fontWeight: 800,
							letterSpacing: '-.03em',
						}}
					>
						{flashcards.length} {flashcards.length === 1 ? 'fiszka' : 'fiszek'}
					</h1>
				</div>
				{flashcards.length > 0 && (
					<button
						className='btn btn-primary'
						onClick={() => setStudyMode(true)}
					>
						<Icons.play size={15} /> Ucz się
					</button>
				)}
			</div>

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

			{/* formularz dodawania fiszki */}
			<form
				onSubmit={handleAdd}
				className='glass glass-frost'
				style={{ borderRadius: 22, padding: 20, marginBottom: 20 }}
			>
				<h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>
					Dodaj fiszkę
				</h3>
				<div
					style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
				>
					<textarea
						value={question}
						onChange={(e) => setQuestion(e.target.value)}
						placeholder='Pytanie / przód karty'
						rows={3}
						required
						style={{
							padding: '10px 13px',
							borderRadius: 13,
							border: '1px solid rgba(167,139,250,.25)',
							background: 'rgba(255,255,255,.6)',
							fontSize: 13.5,
							fontFamily: 'inherit',
							color: 'var(--ink-900)',
							outline: 'none',
							resize: 'vertical',
						}}
					/>
					<textarea
						value={answer}
						onChange={(e) => setAnswer(e.target.value)}
						placeholder='Odpowiedź / tył karty'
						rows={3}
						required
						style={{
							padding: '10px 13px',
							borderRadius: 13,
							border: '1px solid rgba(167,139,250,.25)',
							background: 'rgba(255,255,255,.6)',
							fontSize: 13.5,
							fontFamily: 'inherit',
							color: 'var(--ink-900)',
							outline: 'none',
							resize: 'vertical',
						}}
					/>
				</div>
				<div
					style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}
				>
					<button type='submit' className='btn btn-primary' disabled={saving}>
						<Icons.plus size={15} /> {saving ? 'Dodaję…' : 'Dodaj fiszkę'}
					</button>
				</div>
			</form>

			{/* lista fiszek */}
			{loading ? (
				<div className='muted' style={{ fontSize: 14, padding: '12px 4px' }}>
					Ładowanie…
				</div>
			) : flashcards.length === 0 ? (
				<div
					className='glass glass-frost'
					style={{
						borderRadius: 18,
						padding: '32px 24px',
						textAlign: 'center',
						border: '1px dashed rgba(167,139,250,.35)',
						boxShadow: 'none',
					}}
				>
					<Icons.cards size={32} stroke='#a78bfa' />
					<p style={{ margin: '12px 0 4px', fontSize: 15, fontWeight: 700 }}>
						Brak fiszek
					</p>
					<p className='muted' style={{ margin: 0, fontSize: 13 }}>
						Dodaj pierwszą fiszkę powyżej.
					</p>
				</div>
			) : (
				<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
					{flashcards.map((card) => (
						<div
							key={card.id}
							data-tilt
							className='glass glass-frost'
							style={{
								borderRadius: 18,
								padding: '16px 18px',
								display: 'grid',
								gridTemplateColumns: '1fr 1fr auto',
								gap: 16,
								alignItems: 'center',
							}}
						>
							<div>
								<div className='eyebrow' style={{ marginBottom: 4 }}>
									Pytanie
								</div>
								<div
									style={{
										fontSize: 14,
										color: 'var(--ink-900)',
										lineHeight: 1.45,
									}}
								>
									{card.question}
								</div>
							</div>
							<div>
								<div className='eyebrow' style={{ marginBottom: 4 }}>
									Odpowiedź
								</div>
								<div
									style={{
										fontSize: 14,
										color: 'var(--ink-700)',
										lineHeight: 1.45,
									}}
								>
									{card.answer}
								</div>
							</div>
							<button
								className='iconbtn'
								style={{ width: 30, height: 30 }}
								onClick={() => handleDelete(card.id)}
								title='Usuń'
							>
								<Icons.close size={14} />
							</button>
						</div>
					))}
				</div>
			)}

			<div style={{ height: 8 }} />
		</div>
	);
}

/* ---- tryb nauki z odwracaniem karty ---- */
function StudyMode({ flashcards, onExit }) {
	const [queue, setQueue] = useState(flashcards); // karty w bieżącej rundzie
	const [currentIdx, setCurrentIdx] = useState(0);
	const [flipped, setFlipped] = useState(false);
	const [known, setKnown] = useState([]); // id kart które znam
	const [unknown, setUnknown] = useState([]); // id kart których nie znam
	const [phase, setPhase] = useState('study'); // 'study' | 'summary'

	const card = queue[currentIdx];
	const total = queue.length;
	const isLast = currentIdx === total - 1;

	const goNext = () => {
		if (isLast) {
			setPhase('summary');
		} else {
			setCurrentIdx(currentIdx + 1);
			setFlipped(false);
		}
	};

	const markKnown = () => {
		setKnown([...known, card.id]);
		goNext();
	};

	const markUnknown = () => {
		setUnknown([...unknown, card.id]);
		goNext();
	};

	const retryUnknown = () => {
		setQueue(flashcards.filter((c) => unknown.includes(c.id)));
		setCurrentIdx(0);
		setKnown([]);
		setUnknown([]);
		setFlipped(false);
		setPhase('study');
	};

	// --- ekran podsumowania ---
	if (phase === 'summary') {
		const total_known = known.length;
		const total_unknown = unknown.length;
		return (
			<div
				style={{
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 28,
				}}
			>
				<div
					className='glass glass-frost'
					style={{
						borderRadius: 28,
						padding: '36px 40px',
						maxWidth: 480,
						width: '100%',
						textAlign: 'center',
					}}
				>
					<div className='eyebrow' style={{ marginBottom: 10 }}>
						Koniec sesji
					</div>
					<h2
						style={{
							margin: '0 0 24px',
							fontSize: 26,
							fontWeight: 800,
							letterSpacing: '-.03em',
						}}
					>
						Wynik:{' '}
						<span className='grad-text'>
							{total_known} / {total}
						</span>
					</h2>

					<div
						style={{
							display: 'flex',
							gap: 14,
							justifyContent: 'center',
							marginBottom: 28,
						}}
					>
						<div
							style={{
								flex: 1,
								padding: '18px 16px',
								borderRadius: 18,
								background: 'rgba(70,214,179,.10)',
								border: '1px solid rgba(70,214,179,.25)',
							}}
						>
							<div style={{ fontSize: 28, fontWeight: 800, color: '#2faa8c' }}>
								{total_known}
							</div>
							<div className='muted' style={{ fontSize: 12.5, marginTop: 3 }}>
								Umiem
							</div>
						</div>
						<div
							style={{
								flex: 1,
								padding: '18px 16px',
								borderRadius: 18,
								background: 'rgba(248,81,73,.08)',
								border: '1px solid rgba(248,81,73,.2)',
							}}
						>
							<div style={{ fontSize: 28, fontWeight: 800, color: '#c0392b' }}>
								{total_unknown}
							</div>
							<div className='muted' style={{ fontSize: 12.5, marginTop: 3 }}>
								Nie umiem
							</div>
						</div>
					</div>

					<div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
						<button className='btn btn-ghost' onClick={onExit}>
							Zakończ
						</button>
						{total_unknown > 0 && (
							<button className='btn btn-primary' onClick={retryUnknown}>
								<Icons.reset size={15} /> Powtórz błędy ({total_unknown})
							</button>
						)}
					</div>
				</div>
			</div>
		);
	}

	// --- ekran nauki ---
	return (
		<div
			style={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 28,
			}}
		>
			{/* pasek postępu */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 14,
					width: '100%',
					maxWidth: 560,
				}}
			>
				<button className='iconbtn' onClick={onExit} title='Wyjdź'>
					<Icons.close size={16} />
				</button>
				<div
					style={{
						flex: 1,
						height: 6,
						background: 'rgba(167,139,250,.18)',
						borderRadius: 99,
					}}
				>
					<div
						style={{
							height: '100%',
							borderRadius: 99,
							width: `${((currentIdx + 1) / total) * 100}%`,
							background:
								'linear-gradient(90deg, var(--violet-400), var(--violet-600))',
							transition: 'width .3s ease',
						}}
					/>
				</div>
				<span
					className='muted'
					style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}
				>
					{currentIdx + 1} / {total}
				</span>
			</div>

			{/* karta do odwrócenia */}
			<div
				onClick={() => setFlipped((f) => !f)}
				style={{
					width: '100%',
					maxWidth: 560,
					height: 280,
					cursor: 'pointer',
					perspective: '1000px',
				}}
			>
				<div
					style={{
						width: '100%',
						height: '100%',
						position: 'relative',
						transformStyle: 'preserve-3d',
						transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
						transition: 'transform 0.45s cubic-bezier(0.4, 0.2, 0.2, 1)',
					}}
				>
					{/* przód */}
					<div
						className='glass glass-frost'
						style={{
							position: 'absolute',
							inset: 0,
							borderRadius: 26,
							backfaceVisibility: 'hidden',
							WebkitBackfaceVisibility: 'hidden',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							padding: 32,
							textAlign: 'center',
							gap: 12,
						}}
					>
						<div className='eyebrow'>Pytanie</div>
						<div
							style={{
								fontSize: 22,
								fontWeight: 700,
								lineHeight: 1.3,
								color: 'var(--ink-900)',
							}}
						>
							{card.question}
						</div>
						<div className='muted' style={{ fontSize: 13, marginTop: 8 }}>
							Kliknij, żeby odkryć odpowiedź
						</div>
					</div>

					{/* tył */}
					<div
						className='glass glass-frost'
						style={{
							position: 'absolute',
							inset: 0,
							borderRadius: 26,
							backfaceVisibility: 'hidden',
							WebkitBackfaceVisibility: 'hidden',
							transform: 'rotateY(180deg)',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							padding: 32,
							textAlign: 'center',
							gap: 12,
							background: 'rgba(124,92,255,.08)',
						}}
					>
						<div className='eyebrow' style={{ color: 'var(--violet-600)' }}>
							Odpowiedź
						</div>
						<div
							style={{
								fontSize: 22,
								fontWeight: 700,
								lineHeight: 1.3,
								color: 'var(--ink-900)',
							}}
						>
							{card.answer}
						</div>
					</div>
				</div>
			</div>

			{/* przyciski oceny — widoczne dopiero po odkryciu odpowiedzi */}
			{flipped ? (
				<div style={{ display: 'flex', gap: 14 }}>
					<button
						onClick={markUnknown}
						style={{
							padding: '12px 28px',
							borderRadius: 999,
							border: '1px solid rgba(248,81,73,.35)',
							background: 'rgba(248,81,73,.08)',
							color: '#c0392b',
							fontFamily: 'inherit',
							fontSize: 15,
							fontWeight: 700,
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							gap: 8,
						}}
					>
						<Icons.close size={16} /> Nie umiem
					</button>
					<button
						onClick={markKnown}
						style={{
							padding: '12px 28px',
							borderRadius: 999,
							border: '1px solid rgba(70,214,179,.35)',
							background: 'rgba(70,214,179,.10)',
							color: '#2faa8c',
							fontFamily: 'inherit',
							fontSize: 15,
							fontWeight: 700,
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							gap: 8,
						}}
					>
						<Icons.check size={16} /> Umiem
					</button>
				</div>
			) : (
				<div className='muted' style={{ fontSize: 13 }}>
					Kliknij kartę, żeby zobaczyć odpowiedź
				</div>
			)}
		</div>
	);
}
