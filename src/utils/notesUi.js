/* notesUi.js — drobne wspólne rzeczy dla widoków notatek */

export const inputStyle = {
	padding: '11px 14px',
	borderRadius: 13,
	border: '1px solid rgba(167,139,250,.25)',
	background: 'rgba(255,255,255,.6)',
	fontSize: 14,
	fontFamily: 'inherit',
	color: 'var(--ink-900)',
	outline: 'none',
};

// 1 notatka, 2–4 notatki, 5+ notatek (z wyjątkiem 12–14)
export function noteWord(n) {
	if (n === 1) return 'notatka';
	const lastTwo = n % 100;
	const last = n % 10;
	if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'notatki';
	return 'notatek';
}
