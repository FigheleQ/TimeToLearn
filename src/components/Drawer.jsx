/* Drawer.jsx — panel wysuwany z boku ekranu (menu na telefonie, widżety na telefonie/tablecie)
 *
 * Zawartość jest zamontowana cały czas, a zamknięty panel jest tylko schowany (inert + transform).
 * Dzięki temu np. Pomodoro w widżetach nie traci odliczania, gdy panel się zamyka.
 * Zamyka się: kliknięciem w tło, klawiszem Esc albo przyciskiem ✕.
 */
import { useEffect } from 'react';
import { Icons } from '../lib/icons';

export default function Drawer({ open, onClose, side = 'left', width = 300, label, testId, children }) {
	useEffect(() => {
		if (!open) return;
		const onKey = (e) => {
			if (e.key === 'Escape') onClose();
		};
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden'; // strona pod panelem się nie przewija
		window.addEventListener('keydown', onKey);
		return () => {
			document.body.style.overflow = prevOverflow;
			window.removeEventListener('keydown', onKey);
		};
	}, [open, onClose]);

	return (
		<div
			className={`drawer-root${open ? ' drawer-root--open' : ''}`}
			data-testid={testId ? `${testId}-root` : undefined}
			aria-hidden={!open}
			inert={!open}
		>
			<div
				data-testid={testId ? `${testId}-backdrop` : undefined}
				className='drawer-backdrop'
				onClick={onClose}
			/>
			<aside
				data-testid={testId}
				role='dialog'
				aria-modal='true'
				aria-label={label}
				className={`drawer-panel drawer-panel--${side}`}
				style={{ width: `min(${width}px, 88vw)` }}
			>
				<div style={{ display: 'flex', justifyContent: side === 'left' ? 'flex-end' : 'flex-start' }}>
					<button
						type='button'
						data-testid={testId ? `${testId}-close` : undefined}
						className='iconbtn'
						onClick={onClose}
						aria-label='Zamknij panel'
						style={{ background: 'rgba(255,255,255,.85)' }}
					>
						<Icons.close size={16} />
					</button>
				</div>
				<div style={{ flex: 1, minHeight: 0 }}>{children}</div>
			</aside>
		</div>
	);
}
