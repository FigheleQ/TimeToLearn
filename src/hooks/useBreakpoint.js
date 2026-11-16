/* useBreakpoint.js — na jakim ekranie jesteśmy (telefon / tablet / komputer)
 *
 * Progi spójne z src/styles/responsive.css:
 *   phone   < 768 px
 *   tablet  768–1199 px
 *   desktop ≥ 1200 px
 * Hook nasłuchuje matchMedia, więc obrót telefonu albo zmiana szerokości okna od razu przerysowuje układ.
 */
import { useSyncExternalStore } from 'react';

export const BREAKPOINTS = { tablet: 768, desktop: 1200 };

const PHONE_QUERY = `(max-width: ${BREAKPOINTS.tablet - 1}px)`;
const DESKTOP_QUERY = `(min-width: ${BREAKPOINTS.desktop}px)`;
// dotyk jako główne wejście (telefon, tablet) — tam nie działa przeciąganie HTML5
const COARSE_QUERY = '(pointer: coarse)';

function subscribe(callback) {
	const lists = [PHONE_QUERY, DESKTOP_QUERY, COARSE_QUERY].map((q) => window.matchMedia(q));
	lists.forEach((l) => l.addEventListener('change', callback));
	return () => lists.forEach((l) => l.removeEventListener('change', callback));
}

function getBreakpoint() {
	if (window.matchMedia(PHONE_QUERY).matches) return 'phone';
	if (window.matchMedia(DESKTOP_QUERY).matches) return 'desktop';
	return 'tablet';
}

export function useBreakpoint() {
	return useSyncExternalStore(subscribe, getBreakpoint, () => 'desktop');
}

export function useIsTouch() {
	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(COARSE_QUERY).matches,
		() => false,
	);
}
