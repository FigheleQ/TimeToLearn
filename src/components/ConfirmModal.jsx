/* ConfirmModal.jsx — współdzielony modal potwierdzenia
 * Wzorowany na lokalnym ConfirmModal z HabitsPage (tamten zostaje bez zmian).
 * Dodatkowo: własne etykiety, wariant danger, dowolna treść (children),
 * cancelLabel={null} ukrywa przycisk anulowania (np. okno "What's new").
 */
import { useRef, useState } from 'react';

const btnBase = {
	padding: '10px 22px',
	borderRadius: 12,
	border: 'none',
	cursor: 'pointer',
	fontFamily: 'inherit',
	fontSize: 14,
	fontWeight: 700,
};

export default function ConfirmModal({
	title,
	message,
	children,
	onConfirm,
	onCancel,
	confirmLabel = 'Tak',
	cancelLabel = 'Nie',
	danger = false,
	maxWidth = 380,
	testId = 'confirm-modal',
}) {
	const [closing, setClosing] = useState(false);
	const pending = useRef(null);

	// najpierw animacja wyjścia, akcja dopiero po jej zakończeniu
	const requestClose = (action) => {
		if (closing) return;
		pending.current = action;
		setClosing(true);
	};

	// modalRise (wejście) też odpala onAnimationEnd — reagujemy tylko przy zamykaniu
	const handleAnimEnd = (e) => {
		if (e.target !== e.currentTarget) return;
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
				data-testid={testId}
				role='dialog'
				aria-modal='true'
				aria-label={title}
				className={`glass modal-card${closing ? ' modal-card--out' : ''}`}
				onAnimationEnd={handleAnimEnd}
				style={{
					borderRadius: 22,
					padding: 28,
					maxWidth,
					width: '100%',
					maxHeight: 'calc(100vh - 48px)',
					overflowY: 'auto',
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
				{message && (
					<p
						style={{
							margin: '0 0 16px',
							fontSize: 14,
							color: 'var(--ink-500)',
							lineHeight: 1.55,
						}}
					>
						{message}
					</p>
				)}
				{children}
				<div
					style={{
						display: 'flex',
						gap: 10,
						justifyContent: 'flex-end',
						marginTop: 20,
					}}
				>
					{cancelLabel !== null && (
						<button
							data-testid={`${testId}-cancel`}
							onClick={() => requestClose(onCancel)}
							style={{
								...btnBase,
								background: 'rgba(0,0,0,.05)',
								color: 'var(--ink-700)',
							}}
						>
							{cancelLabel}
						</button>
					)}
					<button
						data-testid={`${testId}-confirm`}
						onClick={() => requestClose(onConfirm)}
						style={{
							...btnBase,
							color: '#fff',
							background: danger
								? 'linear-gradient(135deg, #ff6b6b, #e5484d)'
								: 'linear-gradient(180deg, var(--violet-500), var(--violet-600))',
							boxShadow: danger
								? '0 8px 18px -6px rgba(229,72,77,.55)'
								: '0 8px 18px -6px rgba(124,92,255,.6)',
						}}
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
