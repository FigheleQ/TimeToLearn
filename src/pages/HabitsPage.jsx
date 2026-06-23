import { useState, useEffect, useRef } from 'react';
import { Icons } from '../lib/icons';
import {
	getHabits,
	createHabit,
	deleteHabit,
	deleteHabitLogs,
	setHabitTracked,
	getTodayHabits,
	getHabitLogs,
	logHabit,
	unlogHabit,
	calculateStreak,
} from '../services/supabase';

const ICON_OPTIONS = [
	'bolt',
	'flame',
	'target',
	'sparkle',
	'book',
	'check',
	'clock',
	'atom',
	'chart',
	'bell',
	'globe',
	'note',
];
const COLOR_PRESETS = [
	'#7c5cff',
	'#ffba5c',
	'#fb6f92',
	'#46d6b3',
	'#60a5fa',
	'#f97316',
];
const MAX_TRACKED = 4;

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

// Zamienia freq nawyku na ludzki opis pokazywany pod nazwą ("codziennie" itd.)
function freqLabel(habit) {
	switch (habit.freq) {
		case 'daily':
			return 'codziennie';
		case 'weekly':
			return 'co tydzień';
		case 'custom':
			return `co ${habit.interval_days} dni`;
		default:
			return 'nieprawidłowa wpisana wartość';
	}
}

function ConfirmModal({ title, message, onConfirm, onCancel }) {
	const [closing, setClosing] = useState(false);
	const pending = useRef(null);

	// najpierw odpalamy animację wyjścia, akcję wołamy dopiero gdy się skończy
	const requestClose = (action) => {
		if (closing) return;
		pending.current = action;
		setClosing(true);
	};

	// modalRise (wejście) też tu trafia — dlatego wołamy akcję tylko przy zamykaniu
	const handleAnimEnd = () => {
		if (closing) pending.current?.();
	};

	return (
		<div
			className={`modal-overlay${closing ? ' modal-overlay--out' : ''}`}
			style={{
				position: 'fixed',
				inset: 0,
				zIndex: 1000,
				background: 'rgba(0,0,0,.35)',
				backdropFilter: 'blur(6px)',
				display: 'grid',
				placeItems: 'center',
				padding: 24,
			}}
		>
			<div
				className={`glass modal-card${closing ? ' modal-card--out' : ''}`}
				onAnimationEnd={handleAnimEnd}
				style={{
					borderRadius: 22,
					padding: 28,
					maxWidth: 340,
					width: '100%',
					background: 'rgba(255,255,255,.95)',
					boxShadow: '0 24px 60px -12px rgba(0,0,0,.22)',
				}}
			>
				<h3
					style={{
						margin: '0 0 8px',
						fontSize: 17,
						fontWeight: 800,
						color: 'var(--ink-900)',
					}}
				>
					{title}
				</h3>
				<p
					style={{
						margin: '0 0 24px',
						fontSize: 14,
						color: 'var(--ink-500)',
						lineHeight: 1.55,
					}}
				>
					{message}
				</p>
				<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
					<button
						onClick={() => requestClose(onCancel)}
						style={{
							padding: '10px 22px',
							borderRadius: 12,
							border: 'none',
							cursor: 'pointer',
							fontFamily: 'inherit',
							fontSize: 14,
							fontWeight: 700,
							background: 'color-mix(in srgb, #f85149 12%, white)',
							color: '#f85149',
						}}
					>
						Nie
					</button>
					<button
						onClick={() => requestClose(onConfirm)}
						style={{
							padding: '10px 22px',
							borderRadius: 12,
							border: 'none',
							cursor: 'pointer',
							fontFamily: 'inherit',
							fontSize: 14,
							fontWeight: 700,
							background: 'linear-gradient(135deg, #46d6b3, #2faa8c)',
							color: '#fff',
							boxShadow: '0 8px 18px -6px #46d6b390',
						}}
					>
						Tak
					</button>
				</div>
			</div>
		</div>
	);
}

function AddHabitForm({ onSave, onCancel }) {
	const [label, setLabel] = useState('');
	const [icon, setIcon] = useState('bolt');
	const [color, setColor] = useState('#7c5cff');
	const [freq, setFreq] = useState('daily');
	// liczba dni dla trybu 'custom' (np. 3 = "co 3 dni"). Ignorowane dla daily/weekly.
	const [intervalDays, setIntervalDays] = useState(2);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!label.trim()) return;
		const payload = {
			label: label.trim(),
			icon,
			color,
			freq,
			interval_days: freq === 'custom' ? intervalDays : null,
		};
		onSave(payload);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='glass glass-frost'
			style={{ borderRadius: 18, padding: 20, marginBottom: 16 }}
		>
			<input
				value={label}
				onChange={(e) => setLabel(e.target.value)}
				placeholder='Nazwa nawyku'
				style={{
					width: '100%',
					padding: '10px 14px',
					borderRadius: 11,
					border: '1px solid rgba(167,139,250,.25)',
					background: 'rgba(255,255,255,.6)',
					fontSize: 14,
					fontFamily: 'inherit',
					color: 'var(--ink-900)',
					outline: 'none',
					boxSizing: 'border-box',
					marginBottom: 14,
				}}
			/>

			<div className='eyebrow' style={{ marginBottom: 8 }}>
				Ikona
			</div>
			<div
				style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}
			>
				{ICON_OPTIONS.map((name) => {
					const I = Icons[name];
					return (
						<button
							key={name}
							type='button'
							onClick={() => setIcon(name)}
							style={{
								width: 36,
								height: 36,
								borderRadius: 10,
								border: 'none',
								cursor: 'pointer',
								display: 'grid',
								placeItems: 'center',
								background: icon === name ? color : 'rgba(167,139,250,.12)',
								color: icon === name ? '#fff' : 'var(--ink-500)',
								transition: 'all .15s',
							}}
						>
							<I size={18} />
						</button>
					);
				})}
			</div>

			<div className='eyebrow' style={{ marginBottom: 8 }}>
				Kolor
			</div>
			<div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
				{COLOR_PRESETS.map((c) => (
					<button
						key={c}
						type='button'
						onClick={() => setColor(c)}
						style={{
							width: 28,
							height: 28,
							borderRadius: '50%',
							cursor: 'pointer',
							background: c,
							border:
								color === c
									? '3px solid var(--ink-900)'
									: '3px solid transparent',
							transition: 'border .15s',
						}}
					/>
				))}
			</div>

			<div className='eyebrow' style={{ marginBottom: 8 }}>
				Częstotliwość
			</div>
			<div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
				{[
					['daily', 'Codziennie'],
					['weekly', 'Co tydzień'],
					['custom', 'Co N dni'],
				].map(([val, lbl]) => (
					<button
						key={val}
						type='button'
						onClick={() => setFreq(val)}
						style={{
							padding: '7px 16px',
							borderRadius: 10,
							border: 'none',
							cursor: 'pointer',
							fontSize: 13,
							fontWeight: 600,
							fontFamily: 'inherit',
							background:
								freq === val ? 'var(--violet-500)' : 'rgba(167,139,250,.12)',
							color: freq === val ? '#fff' : 'var(--ink-500)',
						}}
					>
						{lbl}
					</button>
				))}
			</div>

			{/* pole widoczne tylko dla trybu "co N dni" */}
			{freq === 'custom' && (
				<div style={{ marginBottom: 20 }}>
					<div className='eyebrow' style={{ marginBottom: 8 }}>
						Co ile dni
					</div>
					<input
						type='number'
						min={2}
						value={intervalDays}
						onChange={(e) => {
							const n = parseInt(e.target.value, 10);
							setIntervalDays(Number.isNaN(n) ? 2 : Math.max(2, n));
						}}
						style={{
							width: 100,
							padding: '8px 12px',
							borderRadius: 10,
							border: '1px solid rgba(167,139,250,.25)',
							background: 'rgba(255,255,255,.6)',
							fontSize: 14,
							fontFamily: 'inherit',
							color: 'var(--ink-900)',
							outline: 'none',
							boxSizing: 'border-box',
						}}
					/>
					<span className='muted' style={{ fontSize: 12, marginLeft: 8 }}>
						np. 3 = co 3 dni
					</span>
				</div>
			)}

			<div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
				<button
					type='button'
					onClick={onCancel}
					className='btn'
					style={{ fontSize: 13 }}
				>
					Anuluj
				</button>
				<button
					type='submit'
					className='btn btn-primary'
					style={{ fontSize: 13 }}
				>
					<Icons.check size={15} /> Zapisz
				</button>
			</div>
		</form>
	);
}

export default function HabitsPage() {
	const [habits, setHabits] = useState([]);
	const [todayLogs, setTodayLogs] = useState([]);
	const [allLogs, setAllLogs] = useState([]);
	const [note, setNote] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showAddForm, setShowAddForm] = useState(false);
	const [confirm, setConfirm] = useState(null);

	useEffect(() => {
		const fetch = async () => {
			const [habitRes, todayRes, logsRes] = await Promise.all([
				getHabits(),
				getTodayHabits(),
				getHabitLogs(),
			]);
			if (habitRes.error || todayRes.error || logsRes.error) {
				setError(
					habitRes.error?.message ||
						todayRes.error?.message ||
						logsRes.error?.message,
				);
			} else {
				setHabits(habitRes.data);
				setTodayLogs(todayRes.data);
				setAllLogs(logsRes.data);
			}
			setLoading(false);
		};
		fetch();
	}, []);

	const handleCheck = async (habit) => {
		const alreadyDone = todayLogs.some((l) => l.habit_id === habit.id);
		if (alreadyDone) {
			await unlogHabit(habit.id);
			setTodayLogs(todayLogs.filter((l) => l.habit_id !== habit.id));
		} else {
			const { data } = await logHabit(habit.id, habit.label);
			setTodayLogs([...todayLogs, data]);
		}
	};

	const handleAddNote = async () => {
		if (!note.trim()) return;
		const { data } = await logHabit(null, 'note', note.trim());
		setAllLogs([data, ...allLogs]);
		setNote('');
	};

	const handleToggleTracked = (habit) => {
		if (!habit.tracked && trackedCount >= MAX_TRACKED) return;
		if (habit.tracked) {
			setConfirm({ type: 'untrack', habit });
		} else {
			execStartTracking(habit);
		}
	};

	const execStartTracking = async (habit) => {
		const { error } = await setHabitTracked(habit.id, true);
		if (error) {
			setError(error.message);
			return;
		}
		setHabits(
			habits.map((h) => (h.id === habit.id ? { ...h, tracked: true } : h)),
		);
	};

	const execStopTracking = async (habit) => {
		const { error } = await setHabitTracked(habit.id, false);
		if (error) {
			setError(error.message);
			return;
		}
		await deleteHabitLogs(habit.id);
		setHabits(
			habits.map((h) => (h.id === habit.id ? { ...h, tracked: false } : h)),
		);
		setAllLogs(allLogs.filter((l) => l.habit_id !== habit.id));
		setTodayLogs(todayLogs.filter((l) => l.habit_id !== habit.id));
	};

	const handleAddHabit = async (formData) => {
		const { data, error } = await createHabit(formData);
		if (error) {
			setError(error.message);
			return;
		}
		setHabits([...habits, data]);
		setShowAddForm(false);
	};

	const handleDeleteHabit = (habit) => {
		setConfirm({ type: 'delete', habit });
	};

	const execDeleteHabit = async (habit) => {
		const { error } = await deleteHabit(habit.id);
		if (error) {
			setError(error.message);
			return;
		}
		setHabits(habits.filter((h) => h.id !== habit.id));
		setAllLogs(allLogs.filter((l) => l.habit_id !== habit.id));
		setTodayLogs(todayLogs.filter((l) => l.habit_id !== habit.id));
	};

	const handleConfirm = async () => {
		const c = confirm;
		setConfirm(null);
		if (c.type === 'untrack') await execStopTracking(c.habit);
		if (c.type === 'delete') await execDeleteHabit(c.habit);
	};

	const isDone = (habitId) => todayLogs.some((l) => l.habit_id === habitId);
	// przekazujemy też interval_days, żeby calculateStreak umiał policzyć tryb 'custom'
	const streak = (habit) =>
		calculateStreak(allLogs, habit.id, habit.freq, habit.interval_days);
	const trackedHabits = habits.filter((h) => h.tracked);
	const trackedCount = trackedHabits.length;

	const timelineEntries = allLogs.filter(
		(l) => l.habit_id !== null || l.habit === 'note',
	);
	const grouped = groupByDate(timelineEntries);
	const sortedDates = Object.keys(grouped).sort().reverse();

	return (
		<div
			className='scroll'
			style={{ overflowY: 'auto', paddingRight: 4, height: '100%' }}
		>
			{confirm && (
				<ConfirmModal
					title={
						confirm.type === 'untrack' ? 'Przerwać streak?' : 'Usunąć nawyk?'
					}
					message={
						confirm.type === 'untrack'
							? `Postępy i historia nawyku "${confirm.habit.label}" zostaną usunięte. Tego nie można cofnąć.`
							: `Nawyk "${confirm.habit.label}" i cała jego historia zostaną trwale usunięte.`
					}
					onConfirm={handleConfirm}
					onCancel={() => setConfirm(null)}
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
					{todayLogs.filter((l) => l.habit_id !== null).length} /{' '}
					{habits.length} dziś
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

			{/* ── ŚLEDZONE STREAKI ── */}
			{trackedHabits.length > 0 && (
				<section style={{ marginBottom: 28 }}>
					<div style={{ margin: '0 4px 14px' }}>
						<div className='eyebrow'>Aktywne</div>
						<h2
							style={{
								margin: '5px 0 0',
								fontSize: 19,
								fontWeight: 800,
								letterSpacing: '-.025em',
							}}
						>
							Śledzone streaki
						</h2>
					</div>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(2, 1fr)',
							gap: 14,
						}}
					>
						{trackedHabits.map((habit) => {
							const done = isDone(habit.id);
							const s = streak(habit);
							const I = Icons[habit.icon] ?? Icons.check;
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
										<div
											style={{ display: 'flex', alignItems: 'center', gap: 12 }}
										>
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
													{freqLabel(habit)}
												</div>
											</div>
										</div>
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
									<button
										onClick={() => handleCheck(habit)}
										style={{
											width: '100%',
											padding: '11px',
											borderRadius: 13,
											cursor: 'pointer',
											fontFamily: 'inherit',
											fontSize: 14,
											fontWeight: 700,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											gap: 8,
											border: done ? 'none' : `1.5px dashed ${habit.color}60`,
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
										{done ? (
											<Icons.check size={17} />
										) : (
											<Icons.plus size={17} />
										)}
										{done ? 'Zrobione!' : 'Oznacz jako zrobione'}
									</button>
								</div>
							);
						})}
					</div>
				</section>
			)}

			{/* ── WSZYSTKIE NAWYKI ── */}
			<section style={{ marginBottom: 28 }}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						margin: '0 4px 14px',
					}}
				>
					<div>
						<div className='eyebrow'>Zarządzaj</div>
						<h2
							style={{
								margin: '5px 0 0',
								fontSize: 19,
								fontWeight: 800,
								letterSpacing: '-.025em',
							}}
						>
							Nawyki
						</h2>
					</div>
					<button
						className='btn btn-primary'
						onClick={() => setShowAddForm((v) => !v)}
						style={{ fontSize: 13 }}
					>
						<Icons.plus size={15} /> Dodaj nawyk
					</button>
				</div>

				{showAddForm && (
					<AddHabitForm
						onSave={handleAddHabit}
						onCancel={() => setShowAddForm(false)}
					/>
				)}

				{loading ? (
					<div className='muted' style={{ fontSize: 14, padding: '12px 4px' }}>
						Ładowanie…
					</div>
				) : habits.length === 0 ? (
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
						<Icons.target size={32} stroke='#a78bfa' />
						<p style={{ margin: '12px 0 4px', fontSize: 15, fontWeight: 700 }}>
							Brak nawyków
						</p>
						<p className='muted' style={{ margin: 0, fontSize: 13 }}>
							Dodaj pierwszy nawyk, żeby zacząć śledzić postępy.
						</p>
					</div>
				) : (
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(2, 1fr)',
							gap: 14,
						}}
					>
						{habits.map((habit) => {
							const I = Icons[habit.icon] ?? Icons.check;
							return (
								<div
									key={habit.id}
									className='glass glass-frost'
									style={{
										borderRadius: 22,
										padding: '18px 20px',
										border: habit.tracked
											? `1px solid ${habit.color}40`
											: undefined,
									}}
								>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: 12,
											marginBottom: 16,
										}}
									>
										<span
											style={{
												width: 38,
												height: 38,
												borderRadius: 11,
												display: 'grid',
												placeItems: 'center',
												flexShrink: 0,
												background: `color-mix(in srgb, ${habit.color} 14%, white)`,
												color: habit.color,
											}}
										>
											<I size={19} />
										</span>
										<div style={{ flex: 1, minWidth: 0 }}>
											<div
												style={{
													display: 'flex',
													alignItems: 'center',
													gap: 6,
													marginBottom: 2,
												}}
											>
												<div
													style={{
														fontSize: 14,
														fontWeight: 700,
														color: 'var(--ink-900)',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap',
													}}
												>
													{habit.label}
												</div>
												{habit.tracked && (
													<span
														className='chip'
														style={{
															background: `color-mix(in srgb, ${habit.color} 14%, white)`,
															color: habit.color,
															border: 'none',
															fontSize: 11,
															flexShrink: 0,
														}}
													>
														<Icons.flame size={11} stroke={habit.color} />{' '}
														aktywny
													</span>
												)}
											</div>
											<div
												className='muted'
												style={{ fontSize: 11.5, fontWeight: 600 }}
											>
												{freqLabel(habit)}
											</div>
										</div>
										{streak(habit) > 0 && (
											<span
												className='chip'
												style={{
													background: `color-mix(in srgb, ${habit.color} 14%, white)`,
													color: habit.color,
													border: 'none',
													fontSize: 12,
													flexShrink: 0,
												}}
											>
												<Icons.flame size={12} stroke={habit.color} />{' '}
												{streak(habit)}
											</span>
										)}
									</div>
									<div style={{ display: 'flex', gap: 8 }}>
										<button
											onClick={() => handleToggleTracked(habit)}
											disabled={!habit.tracked && trackedCount >= MAX_TRACKED}
											className={`habit-btn-track${habit.tracked ? ' tracked' : ''}`}
											style={{ '--hc': habit.color }}
										>
											{habit.tracked ? (
												<>
													<span className='track-face track-face--idle'>
														<Icons.flame size={14} /> Śledzone
													</span>
													<span className='track-face track-face--hover'>
														<Icons.close size={14} /> Przerwij streak
													</span>
												</>
											) : (
												<span className='track-face track-face--idle'>
													<Icons.plus size={14} /> Zacznij streak
												</span>
											)}
										</button>
										<button
											onClick={() => handleDeleteHabit(habit)}
											className='habit-btn-delete'
											aria-label='Usuń nawyk'
										>
											<span className='del-label'>Usuń</span>
											<Icons.close size={14} />
										</button>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</section>

			{/* ── NOTATKA DNIA ── */}
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

			{/* ── ROADMAPA / TIMELINE ── */}
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
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 12,
									marginBottom: 10,
								}}
							>
								<span
									style={{
										width: 22,
										height: 22,
										borderRadius: '50%',
										flexShrink: 0,
										background: 'linear-gradient(150deg, #a78bfa, #7c5cff)',
										border: '3px solid #f2eefc',
									}}
								/>
								<span
									style={{
										fontSize: 12,
										fontWeight: 700,
										color: 'var(--ink-500)',
										textTransform: 'uppercase',
										letterSpacing: '.06em',
									}}
								>
									{formatDate(dateStr)}
								</span>
							</div>
							<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
								{grouped[dateStr].map((entry) => {
									const habitMeta = habits.find((h) => h.id === entry.habit_id);
									const isNote = entry.habit === 'note';
									const color = habitMeta?.color ?? '#a78bfa';
									const IconComp = isNote
										? Icons.note
										: (Icons[habitMeta?.icon] ?? Icons.check);
									return (
										<div
											key={entry.id}
											style={{
												display: 'flex',
												alignItems: 'flex-start',
												gap: 10,
												background: 'rgba(255,255,255,.55)',
												borderRadius: 13,
												padding: '10px 14px',
												border: '1px solid rgba(255,255,255,.6)',
											}}
										>
											<span
												style={{
													width: 28,
													height: 28,
													borderRadius: 8,
													flexShrink: 0,
													display: 'grid',
													placeItems: 'center',
													background: `color-mix(in srgb, ${color} 14%, white)`,
													color,
												}}
											>
												<IconComp size={15} />
											</span>
											<div style={{ flex: 1, minWidth: 0 }}>
												<div
													style={{
														fontSize: 12,
														fontWeight: 700,
														color: 'var(--ink-500)',
														marginBottom: isNote && entry.note ? 3 : 0,
													}}
												>
													{isNote
														? 'Notatka'
														: (habitMeta?.label ?? entry.habit)}
												</div>
												{entry.note && (
													<div
														style={{
															fontSize: 13,
															color: 'var(--ink-700)',
															lineHeight: 1.45,
														}}
													>
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
