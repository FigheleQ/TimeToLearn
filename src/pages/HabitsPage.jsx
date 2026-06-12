/* HabitsPage.jsx — tracker nawyków + roadmapa */
import { useState, useEffect } from 'react';
import { Icons } from '../lib/icons';
import {
	getTodayHabits,
	getHabitLogs,
	logHabit,
	unlogHabit,
	calculateStreak,
} from '../services/supabase';

const HABITS = [
	{
		id: 'timetolearn',
		label: 'TimeToLearn',
		freq: 'daily',
		icon: 'bolt',
		color: '#7c5cff',
	},
	{
		id: 'python',
		label: 'Nauka Pythona',
		freq: 'daily',
		icon: 'sum',
		color: '#ffba5c',
	},
	{
		id: 'ai',
		label: 'Nauka AI',
		freq: 'daily',
		icon: 'sparkle',
		color: '#fb6f92',
	},
	{
		id: 'project',
		label: 'Projekt wdrożeniowy',
		freq: 'weekly',
		icon: 'target',
		color: '#46d6b3',
	},
];

const DAYS_PL = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];
const MONTHS_PL = [
	'sty',
	'lut',
	'mar',
	'kwi',
	'maj',
	'cze',
	'lip',
	'sie',
	'wrz',
	'paź',
	'lis',
	'gru',
];

function formatDate(dateStr) {
	const d = new Date(dateStr + 'T12:00:00');
	return `${DAYS_PL[d.getDay()]}, ${d.getDate()} ${MONTHS_PL[d.getMonth()]}`;
}

function groupByDate(logs) {
	return logs.reduce((acc, log) => {
		const key = log.completed_date;
		if (!acc[key]) acc[key] = [];
		acc[key].push(log);
		return acc;
	}, {});
}

export default function HabitsPage() {
	const [todayLogs, setTodayLogs] = useState([]);
	const [allLogs, setAllLogs] = useState([]);
	const [note, setNote] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetch = async () => {
			const { data: todayData, error: err1 } = await getTodayHabits();
			const { data: allData, error: err2 } = await getHabitLogs();

			if (err1 || err2) {
				setError(err1?.message || err2?.message);
				setLoading(false);
				return;
			}

			setTodayLogs(todayData);
			setAllLogs(allData);
			setLoading(false);
		};
		fetch();
	}, []);

	const handleCheck = async (habit) => {
		const alreadyDone = todayLogs.some((l) => l.habit === habit.id);
		if (alreadyDone) {
			await unlogHabit(habit.id);
			setTodayLogs(todayLogs.filter((l) => l.habit !== habit.id));
		} else {
			const { data } = await logHabit(habit.id);
			setTodayLogs([...todayLogs, data]);
		}
	};

	const handleAddNote = async () => {
		if (!note.trim()) return;
		const { data } = await logHabit('note', note);
		setAllLogs([data, ...allLogs]);
		setNote('');
	};

	const isDone = (habitId) => todayLogs.some((l) => l.habit === habitId);
	const streak = (habitId, freq) => calculateStreak(allLogs, habitId, freq);

	const timelineEntries = allLogs.filter((l) => l.note || l.habit !== 'note');
	const grouped = groupByDate(timelineEntries);
	const sortedDates = Object.keys(grouped).sort().reverse();

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
					<div className='eyebrow'>Tracker · dzisiaj</div>
					<h1
						style={{
							margin: '6px 0 0',
							fontSize: 26,
							fontWeight: 800,
							letterSpacing: '-.03em',
						}}
					>
						Twoje nawyki
					</h1>
				</div>
				<div
					className='chip'
					style={{
						background: 'color-mix(in srgb, #46d6b3 14%, white)',
						color: '#2faa8c',
						border: 'none',
						fontSize: 13,
					}}
				>
					<Icons.check size={14} stroke='#2faa8c' />
					{todayLogs.filter((l) => l.habit !== 'note').length} / {HABITS.length}{' '}
					dziś
				</div>
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

			{/* karty nawyków */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(2, 1fr)',
					gap: 14,
					marginBottom: 24,
				}}
			>
				{HABITS.map((habit) => {
					const done = isDone(habit.id);
					const s = streak(habit.id, habit.freq);
					const I = Icons[habit.icon];
					return (
						<div
							key={habit.id}
							data-tilt
							className='glass glass-frost'
							style={{
								borderRadius: 22,
								padding: '20px 22px',
								border: done ? `1px solid ${habit.color}40` : undefined,
								background: done
									? `linear-gradient(155deg, color-mix(in srgb, ${habit.color} 8%, white) 0%, rgba(255,255,255,.82) 100%)`
									: undefined,
								transition: 'all .22s cubic-bezier(.2,.8,.2,1)',
							}}
						>
							<div
								style={{
									display: 'flex',
									alignItems: 'flex-start',
									justifyContent: 'space-between',
									marginBottom: 16,
								}}
							>
								<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
									<span
										style={{
											width: 42,
											height: 42,
											borderRadius: 13,
											display: 'grid',
											placeItems: 'center',
											flexShrink: 0,
											background: done
												? `linear-gradient(150deg, ${habit.color}, color-mix(in srgb, ${habit.color} 60%, #7c5cff))`
												: 'rgba(167,139,250,.12)',
											color: done ? '#fff' : habit.color,
											transition: 'background .22s',
										}}
									>
										<I size={20} />
									</span>
									<div>
										<div
											style={{
												fontSize: 14,
												fontWeight: 700,
												color: 'var(--ink-900)',
											}}
										>
											{habit.label}
										</div>
										<div
											className='muted'
											style={{ fontSize: 11.5, fontWeight: 600 }}
										>
											{habit.freq === 'weekly' ? 'co tydzień' : 'codziennie'}
										</div>
									</div>
								</div>

								{/* streak badge */}
								{s > 0 && (
									<span
										className='chip'
										style={{
											background: `color-mix(in srgb, ${habit.color} 14%, white)`,
											color: habit.color,
											border: 'none',
											fontSize: 12,
										}}
									>
										<Icons.flame size={12} stroke={habit.color} /> {s}
									</span>
								)}
							</div>

							{/* check button */}
							<button
								onClick={() => handleCheck(habit)}
								style={{
									width: '100%',
									padding: '11px',
									borderRadius: 13,
									border: done ? 'none' : `1.5px dashed ${habit.color}60`,
									cursor: 'pointer',
									fontFamily: 'inherit',
									fontSize: 14,
									fontWeight: 700,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									gap: 8,
									color: done ? '#fff' : habit.color,
									background: done
										? `linear-gradient(180deg, ${habit.color}, color-mix(in srgb, ${habit.color} 70%, #333))`
										: `color-mix(in srgb, ${habit.color} 8%, white)`,
									boxShadow: done
										? `0 10px 22px -8px ${habit.color}90`
										: 'none',
									transition: 'all .2s cubic-bezier(.2,.8,.2,1)',
								}}
							>
								{done ? <Icons.check size={17} /> : <Icons.plus size={17} />}
								{done ? 'Zrobione!' : 'Oznacz jako zrobione'}
							</button>
						</div>
					);
				})}
			</div>

			{/* sekcja journal / notatka dnia */}
			<section
				className='glass glass-frost'
				style={{ borderRadius: 22, padding: 22, marginBottom: 22 }}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 10,
						marginBottom: 14,
					}}
				>
					<span
						style={{
							width: 30,
							height: 30,
							borderRadius: 9,
							display: 'grid',
							placeItems: 'center',
							background: 'color-mix(in srgb, #7c5cff 16%, white)',
							color: '#7c5cff',
						}}
					>
						<Icons.note size={16} />
					</span>
					<h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
						Notatka dnia
					</h2>
				</div>
				<textarea
					value={note}
					onChange={(e) => setNote(e.target.value)}
					placeholder='Co dziś osiągnąłeś? Co było trudne? Na co zwrócić uwagę jutro…'
					rows={3}
					style={{
						width: '100%',
						padding: '12px 14px',
						borderRadius: 13,
						border: '1px solid rgba(167,139,250,.25)',
						background: 'rgba(255,255,255,.6)',
						fontSize: 14,
						fontFamily: 'inherit',
						color: 'var(--ink-900)',
						outline: 'none',
						resize: 'vertical',
						lineHeight: 1.55,
						boxSizing: 'border-box',
					}}
					onFocus={(e) => {
						e.target.style.borderColor = 'var(--violet-500)';
					}}
					onBlur={(e) => {
						e.target.style.borderColor = 'rgba(167,139,250,.25)';
					}}
				/>
				<div
					style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}
				>
					<button
						className='btn btn-primary'
						onClick={handleAddNote}
						disabled={!note.trim()}
					>
						<Icons.plus size={16} /> Dodaj do roadmapy
					</button>
				</div>
			</section>

			{/* timeline / roadmapa */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					margin: '0 4px 14px',
				}}
			>
				<div>
					<div className='eyebrow'>Historia</div>
					<h2
						style={{
							margin: '5px 0 0',
							fontSize: 19,
							fontWeight: 800,
							letterSpacing: '-.025em',
						}}
					>
						Roadmapa
					</h2>
				</div>
			</div>

			{loading ? (
				<div className='muted' style={{ fontSize: 14, padding: '12px 4px' }}>
					Ładowanie…
				</div>
			) : sortedDates.length === 0 ? (
				<div
					className='glass glass-frost'
					style={{
						borderRadius: 18,
						padding: '28px 24px',
						textAlign: 'center',
						border: '1px dashed rgba(167,139,250,.35)',
						background: 'rgba(255,255,255,.3)',
						boxShadow: 'none',
					}}
				>
					<Icons.note size={32} stroke='#a78bfa' />
					<p style={{ margin: '12px 0 4px', fontSize: 15, fontWeight: 700 }}>
						Brak wpisów
					</p>
					<p className='muted' style={{ margin: 0, fontSize: 13 }}>
						Zacznij od odznaczenia pierwszego nawyku.
					</p>
				</div>
			) : (
				<div style={{ position: 'relative', paddingLeft: 28 }}>
					{/* linia czasu */}
					<div
						style={{
							position: 'absolute',
							left: 11,
							top: 8,
							bottom: 8,
							width: 2,
							background:
								'linear-gradient(180deg, var(--violet-400), rgba(167,139,250,.1))',
							borderRadius: 99,
						}}
					/>

					{sortedDates.map((dateStr) => (
						<div key={dateStr} style={{ marginBottom: 24 }}>

							{/* kropka na linii + data */}
							<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
								<span style={{
									width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
									background: 'linear-gradient(150deg, #a78bfa, #7c5cff)',
									border: '3px solid #f2eefc',
								}} />
								<span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
									{formatDate(dateStr)}
								</span>
							</div>

							{/* wpisy z tego dnia */}
							<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
								{grouped[dateStr].map((entry) => {
									const habitMeta = HABITS.find((h) => h.id === entry.habit);
									const isNote = entry.habit === 'note';
									const color = habitMeta?.color ?? '#a78bfa';
									const IconComp = isNote ? Icons.note : Icons[habitMeta?.icon ?? 'check'];
									return (
										<div key={entry.id} style={{
											display: 'flex', alignItems: 'flex-start', gap: 10,
											background: 'rgba(255,255,255,.55)', borderRadius: 13,
											padding: '10px 14px', border: '1px solid rgba(255,255,255,.6)',
										}}>
											<span style={{
												width: 28, height: 28, borderRadius: 8, flexShrink: 0,
												display: 'grid', placeItems: 'center',
												background: `color-mix(in srgb, ${color} 14%, white)`,
												color,
											}}>
												<IconComp size={15} />
											</span>
											<div style={{ flex: 1, minWidth: 0 }}>
												<div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-500)', marginBottom: isNote && entry.note ? 3 : 0 }}>
													{isNote ? 'Notatka' : habitMeta?.label}
												</div>
												{entry.note && (
													<div style={{ fontSize: 13, color: 'var(--ink-700)', lineHeight: 1.45 }}>
														{entry.note}
													</div>
												)}
											</div>
											{!isNote && <Icons.check size={15} stroke={color} />}
										</div>
									);
								})}
							</div>
						</div>
					))}
				</div>
			)}

			<div style={{ height: 8 }} />
		</div>
	);
}
