import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Auth ─────────────────────────────────────────────────────────────────────
// signIn / signUp / signOut / onAuthStateChange są w AuthContext.jsx

// ─── Decks ────────────────────────────────────────────────────────────────────

export async function getDecks() {
	return supabase.from('decks').select('*, flashcards(count)');
}

export async function createDeck(title, subject) {
	return supabase.from('decks').insert({ title, subject }).select().single();
}

export async function updateDeck(deckId, changes) {
	return supabase
		.from('decks')
		.update(changes)
		.eq('id', deckId)
		.select()
		.single();
}

export async function deleteDeck(deckId) {
	return supabase.from('decks').delete().eq('id', deckId);
}

// ─── Flashcards ───────────────────────────────────────────────────────────────

export async function getFlashcards(deckId) {
	return supabase.from('flashcards').select('*').eq('deck_id', deckId);
}

export async function createFlashcard(deckId, question, answer) {
	return supabase
		.from('flashcards')
		.insert({ deck_id: deckId, question, answer })
		.select()
		.single();
}

export async function updateFlashcard(flashcardId, changes) {
	return supabase
		.from('flashcards')
		.update(changes)
		.eq('id', flashcardId)
		.select()
		.single();
}

export async function deleteFlashcard(flashcardId) {
	return supabase.from('flashcards').delete().eq('id', flashcardId);
}

// ─── Habits (definicje nawyków) ─────────────────────────────────────────────────
// Nawyki nie są już zahardkodowane — każdy user ma własne w tabeli `habits`.
// Wzoruj się na getDecks / createDeck / deleteDeck powyżej.

export async function getHabits() {
	return supabase
		.from('habits')
		.select('*')
		.order('created_at', { ascending: true });
}

// interval_days: liczba dni dla freq === 'custom' ("co N dni"); null dla daily/weekly
export async function createHabit({
	label,
	icon,
	color,
	freq,
	interval_days = null,
}) {
	return supabase
		.from('habits')
		.insert({ label, icon, color, freq, interval_days })
		.select()
		.single();
}

export async function deleteHabit(habitId) {
	return supabase.from('habits').delete().eq('id', habitId);
}

export async function setHabitTracked(habitId, tracked) {
	return supabase
		.from('habits')
		.update({ tracked })
		.eq('id', habitId)
		.select()
		.single();
}

export async function deleteHabitLogs(habitId) {
	return supabase.from('habit_logs').delete().eq('habit_id', habitId);
}

// ─── Habit logs (check-iny + notatki) ───────────────────────────────────────────

function todayStr() {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function getTodayHabits() {
	return supabase
		.from('habit_logs')
		.select('*')
		.eq('completed_date', todayStr());
}

// habitId — uuid z tabeli habits (null dla notatek)
// label   — wyświetlana w timeline (habit.label, lub 'note' dla notatki)
export async function logHabit(habitId, label, note = null) {
	return supabase
		.from('habit_logs')
		.insert({
			habit: label,
			habit_id: habitId,
			completed_date: todayStr(),
			note,
		})
		.select()
		.single();
}

export async function unlogHabit(habitId) {
	return supabase
		.from('habit_logs')
		.delete()
		.eq('habit_id', habitId)
		.eq('completed_date', todayStr());
}

export async function getHabitLogs({ limit = 150 } = {}) {
	return supabase
		.from('habit_logs')
		.select('*')
		.order('completed_date', { ascending: false })
		.order('created_at', { ascending: false })
		.limit(limit);
}

// Oblicza streak dla danego nawyku na podstawie tablicy logów.
// freq: 'daily' → kolejne dni, 'weekly' → kolejne tygodnie, 'custom' → kolejne okna co N dni
// intervalDays: używane TYLKO dla freq === 'custom' (ile dni ma jedno "okno")
export function calculateStreak(
	logs,
	habitId,
	freq = 'daily',
	intervalDays = 1,
) {
	const toStr = (d) => {
		const pad = (n) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
	};

	const dates = [
		...new Set(
			logs.filter((l) => l.habit_id === habitId).map((l) => l.completed_date),
		),
	]
		.sort()
		.reverse();

	if (dates.length === 0) return 0;

	const today = toStr(new Date());
	const yesterday = toStr(new Date(Date.now() - 864e5));

	if (freq === 'daily') {
		if (dates[0] !== today && dates[0] !== yesterday) return 0;
		let streak = 0;
		const cursor = new Date(dates[0] + 'T12:00:00');
		for (const d of dates) {
			if (d === toStr(cursor)) {
				streak++;
				cursor.setDate(cursor.getDate() - 1);
			} else break;
		}
		return streak;
	}

	if (freq === 'weekly') {
		const monday = (dateStr) => {
			const d = new Date(dateStr + 'T12:00:00');
			const day = d.getDay();
			d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
			return toStr(d);
		};
		const weeks = [...new Set(dates.map(monday))].sort().reverse();
		const thisWeek = monday(today);
		const lastWeek = monday(toStr(new Date(Date.now() - 7 * 864e5)));
		if (weeks[0] !== thisWeek && weeks[0] !== lastWeek) return 0;
		let streak = 0;
		const cursor = new Date(weeks[0] + 'T12:00:00');
		for (const w of weeks) {
			if (w === toStr(cursor)) {
				streak++;
				cursor.setDate(cursor.getDate() - 7);
			} else break;
		}
		return streak;
	}

	if (freq === 'custom') {
		if (dates[0] !== today) {
			const diffDays = Math.round(
				(new Date(today + 'T12:00:00') - new Date(dates[0] + 'T12:00:00')) /
					864e5,
			);
			if (diffDays > intervalDays) return 0;
		}
		let streak = 0;
		const cursor = new Date(dates[0] + 'T12:00:00');
		for (const d of dates) {
			if (d === toStr(cursor)) {
				streak++;
				cursor.setDate(cursor.getDate() - intervalDays);
			} else break;
		}
		return streak;
	}

	return 0;
}

// ─── Pomodoro ─────────────────────────────────────────────────────────────────

export async function createPomodoroLog(duration_min, mode = 'work') {
	return supabase
		.from('pomodoro_logs')
		.insert({ duration_min, mode })
		.select()
		.single();
}

// Zwraca logi z ostatnich 7 dni (tylko tryb 'work') do wykresu aktywności
export async function getWeekPomodoroLogs() {
	const weekAgo = new Date();
	weekAgo.setDate(weekAgo.getDate() - 6);
	weekAgo.setHours(0, 0, 0, 0);
	return supabase
		.from('pomodoro_logs')
		.select('*')
		.eq('mode', 'work')
		.gte('completed_at', weekAgo.toISOString());
}

// Zamienia listę logów na format { d: 'Pn', v: 45 } dla każdego z 7 dni tygodnia
export function buildWeekChartData(logs) {
	const DAYS = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];
	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date();
		d.setDate(d.getDate() - (6 - i));
		const dayMinutes = logs
			.filter(
				(l) => new Date(l.completed_at).toDateString() === d.toDateString(),
			)
			.reduce((sum, l) => sum + l.duration_min, 0);
		return { d: DAYS[d.getDay()], v: dayMinutes };
	});
}

// ─── Resources (Tutoriale) ────────────────────────────────────────────────────

export async function getResources() {
	return supabase
		.from('resources')
		.select('*')
		.order('created_at', { ascending: false });
}

export async function createResource({ title, url, platform, category }) {
	return supabase
		.from('resources')
		.insert({ title, url, platform, category })
		.select()
		.single();
}

export async function deleteResource(resourceId) {
	return supabase.from('resources').delete().eq('id', resourceId);
}
