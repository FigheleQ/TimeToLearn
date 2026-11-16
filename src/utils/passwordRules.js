/* passwordRules.js — wymagania dla nowego hasła (rejestracja i reset)
 *
 * Jedna lista reguł: z niej powstaje checklista w UI i walidacja przed wysłaniem.
 * \p{Lu} / \p{Ll} (Unicode) — polskie litery też się liczą: „Ł” to wielka litera, „ż” mała.
 * Znak specjalny = wszystko, co nie jest literą, cyfrą ani spacją (np. ! ? @ # - _ .).
 *
 * Uwaga: walidacja w przeglądarce to wygoda, nie zabezpieczenie — te same wymagania
 * warto ustawić w Supabase (Authentication → Providers → Email → Password requirements).
 */

export const MIN_PASSWORD_LENGTH = 8;

export const PASSWORD_RULES = [
	{
		id: 'length',
		label: `Co najmniej ${MIN_PASSWORD_LENGTH} znaków`,
		test: (pw) => [...pw].length >= MIN_PASSWORD_LENGTH,
	},
	{
		id: 'upper',
		label: 'Jedna wielka litera',
		test: (pw) => /\p{Lu}/u.test(pw),
	},
	{
		id: 'lower',
		label: 'Jedna mała litera',
		test: (pw) => /\p{Ll}/u.test(pw),
	},
	{
		id: 'digit',
		label: 'Jedna cyfra',
		test: (pw) => /\p{Nd}/u.test(pw),
	},
	{
		id: 'special',
		label: 'Jeden znak specjalny (np. ! ? @ #)',
		test: (pw) => /[^\p{L}\p{N}\s]/u.test(pw),
	},
];

// [{ id, label, ok }] — do wyświetlenia checklisty
export function checkPassword(password) {
	return PASSWORD_RULES.map((rule) => ({
		id: rule.id,
		label: rule.label,
		ok: rule.test(password ?? ''),
	}));
}

export function isPasswordStrong(password) {
	return PASSWORD_RULES.every((rule) => rule.test(password ?? ''));
}
