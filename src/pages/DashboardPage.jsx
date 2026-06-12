/* DashboardPage.jsx — main dashboard: hero + deck grid + activity */
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../lib/icons';
import WeekChart from '../components/WeekChart';
import {
	getWeekPomodoroLogs,
	buildWeekChartData,
	getDecks,
	deleteDeck,
} from '../services/supabase';
import DeckCard from '../components/DeckCard';

export default function DashboardPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [decks, setDecks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [weekData, setWeekData] = useState([]);

	const firstName = user?.email?.split('@')[0] ?? 'Hej';

	useEffect(() => {
		const fetchDecks = async () => {
			const { data } = await getDecks();
			setDecks(data ?? []);
			setLoading(false);
		};
		fetchDecks();
	}, []);

	useEffect(() => {
		const fetchWeek = async () => {
			const { data } = await getWeekPomodoroLogs();
			if (data) setWeekData(buildWeekChartData(data));
		};
		fetchWeek();
		window.addEventListener('pomodoro-complete', fetchWeek);
		return () => window.removeEventListener('pomodoro-complete', fetchWeek);
	}, []);

	const dueTotal = decks.reduce((a, d) => a + (d.due ?? 0), 0);

	return (
		<div
			className='scroll'
			style={{ overflowY: 'auto', paddingRight: 4, height: '100%' }}
		>
			{/* hero */}
			<section
				className='glass glass-frost'
				style={{
					borderRadius: 26,
					padding: '26px 28px',
					marginBottom: 18,
					display: 'flex',
					alignItems: 'center',
					gap: 24,
					overflow: 'hidden',
					position: 'relative',
				}}
			>

				<div style={{ flex: 1, position: 'relative' }}>
					<div className='eyebrow'>Pulpit · plan dnia</div>
					<h1
						className='h-display'
						style={{ margin: '8px 0 10px', fontSize: 30 }}
					>
						Cześć {firstName} —{' '}
						{dueTotal > 0 ? (
							<span className='grad-text'>{dueTotal} powtórek na dziś</span>
						) : (
							<span className='grad-text'>gotowy na naukę?</span>
						)}
					</h1>
					<p
						className='muted'
						style={{
							margin: 0,
							fontSize: 14.5,
							maxWidth: 440,
							lineHeight: 1.5,
						}}
					>
						Dodaj swoją pierwszą talię fiszek i zacznij naukę.
					</p>
					<div style={{ display: 'flex', gap: 11, marginTop: 18 }}>
						<button
							className='btn btn-primary'
							style={{ padding: '12px 20px', fontSize: 14.5 }}
							onClick={() => navigate('/flashcards')}
						>
							<Icons.play size={16} /> Rozpocznij naukę
						</button>
						<button className='btn btn-ghost' style={{ padding: '12px 18px' }}
							onClick={() => navigate('/flashcards')}
						>
							<Icons.plus size={16} /> Nowa talia
						</button>
					</div>
				</div>

				{/* stats chips */}
				<div style={{ display: 'flex', gap: 14, position: 'relative' }}>
					{[
						['Passa', '0', 'dni', '#fb6f92', 'flame'],
						['Dziś', '0', 'fiszek', '#7c5cff', 'check'],
						['Czas', '0', 'min', '#46d6b3', 'clock'],
					].map(([l, v, u, c, ic]) => {
						const II = Icons[ic];
						return (
							<div
								key={l}
								data-tilt
								className='glass glass-frost'
								style={{
									borderRadius: 18,
									padding: '16px 18px',
									minWidth: 92,
									textAlign: 'center',
									boxShadow: 'var(--shadow-soft)',
								}}
							>
								<II size={18} stroke={c} />
								<div
									style={{
										fontSize: 26,
										fontWeight: 800,
										letterSpacing: '-.04em',
										marginTop: 6,
										color: 'var(--ink-900)',
									}}
								>
									{v}
								</div>
								<div
									className='muted'
									style={{ fontSize: 11.5, fontWeight: 600 }}
								>
									{l} · {u}
								</div>
							</div>
						);
					})}
				</div>
			</section>

			{/* deck grid */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					margin: '0 4px 14px',
				}}
			>
				<h2
					style={{
						margin: 0,
						fontSize: 19,
						fontWeight: 800,
						letterSpacing: '-.025em',
					}}
				>
					Twoje talie
				</h2>
				<button
					className='btn btn-ghost'
					style={{ fontSize: 13, padding: '8px 14px' }}
					onClick={() => navigate('/flashcards')}
				>
					Wszystkie <Icons.chevR size={15} />
				</button>
			</div>

			{loading ? (
				<div className='muted' style={{ fontSize: 14, padding: '20px 4px' }}>
					Ładowanie…
				</div>
			) : decks.length === 0 ? (
				<div
					className='glass glass-frost'
					style={{
						borderRadius: 22,
						padding: '36px 28px',
						textAlign: 'center',
						marginBottom: 22,
						border: '1px dashed rgba(167,139,250,.35)',
						boxShadow: 'none',
					}}
				>
					<Icons.cards size={36} stroke='#a78bfa' />
					<p style={{ margin: '14px 0 6px', fontSize: 16, fontWeight: 700 }}>
						Brak talii
					</p>
					<p className='muted' style={{ margin: '0 0 18px', fontSize: 14 }}>
						Utwórz swoją pierwszą talię fiszek.
					</p>
					<button className='btn btn-primary' onClick={() => navigate('/flashcards')}>
						<Icons.plus size={16} /> Nowa talia
					</button>
				</div>
			) : (
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(2, 1fr)',
						gap: 16,
						marginBottom: 22,
					}}
				>
					{decks.map((d) => (
						<DeckCard
							key={d.id}
							deck={d}
							onOpen={() => navigate(`/flashcards/${d.id}`)}
							onDelete={async () => {
								const { error } = await deleteDeck(d.id);
								if (!error) setDecks(decks.filter((x) => x.id !== d.id));
							}}
						/>
					))}
				</div>
			)}

			{/* activity row */}
			<div
				style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}
			>
				<section className='glass glass-frost' style={{ borderRadius: 22, padding: 22 }}>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							marginBottom: 16,
						}}
					>
						<div>
							<div className='eyebrow'>Aktywność</div>
							<h3 style={{ margin: '5px 0 0', fontSize: 16, fontWeight: 700 }}>
								Czas nauki w tym tygodniu
							</h3>
						</div>
						<span className='chip'>
							<Icons.chart size={14} stroke='#7c5cff' />{' '}
							{weekData.reduce((s, d) => s + d.v, 0)} min
						</span>
					</div>
					<WeekChart data={weekData} />
				</section>

				<section
					className='glass glass-frost'
					style={{
						borderRadius: 22,
						padding: 22,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
					}}
				>
					<div className='eyebrow'>Wynik tygodnia</div>
					<div
						style={{
							display: 'flex',
							alignItems: 'baseline',
							gap: 8,
							margin: '8px 0 4px',
						}}
					>
						<span
							style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-.04em' }}
							className='grad-text'
						>
							—
						</span>
					</div>
					<p
						className='muted'
						style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5 }}
					>
						Zacznij naukę, żeby zobaczyć statystyki.
					</p>
				</section>
			</div>

			<div style={{ height: 8 }} />
		</div>
	);
}
