/* AuthShell.jsx — wspólny wygląd ekranów logowania / rejestracji / resetu hasła
 *   <AuthShell title subtitle>  — logo, nagłówek i szklana karta
 *   <AuthField label …input>   — pole formularza w stylu LoginPage
 *   <AuthAlert tone>           — komunikat błędu (error) albo sukcesu (success)
 */
import { Icons } from '../lib/icons';

export function AuthShell({ title, subtitle, children }) {
	return (
		<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
			<div style={{ width: '100%', maxWidth: 400 }}>
				<div style={{ textAlign: 'center', marginBottom: 32 }}>
					<span
						style={{
							width: 56,
							height: 56,
							borderRadius: 18,
							display: 'inline-grid',
							placeItems: 'center',
							background: 'linear-gradient(150deg, #a78bfa, #fb6f92)',
							color: '#fff',
							boxShadow: '0 18px 36px -12px rgba(167,139,250,.7)',
							marginBottom: 16,
						}}
					>
						<Icons.bolt size={26} stroke='#fff' />
					</span>
					<h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-.03em' }}>
						{title}
					</h1>
					{subtitle && (
						<p className='muted' style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.5 }}>
							{subtitle}
						</p>
					)}
				</div>
				<div className='glass glass-frost' style={{ borderRadius: 28, padding: 32 }}>
					{children}
				</div>
			</div>
		</div>
	);
}

export function AuthField({ label, id, ...inputProps }) {
	return (
		<div>
			<label
				htmlFor={id}
				style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--ink-700)' }}
			>
				{label}
			</label>
			<input
				id={id}
				{...inputProps}
				style={{
					width: '100%',
					padding: '12px 16px',
					borderRadius: 13,
					fontSize: 14,
					fontFamily: 'inherit',
					border: '1px solid rgba(167,139,250,.3)',
					background: 'rgba(255,255,255,.6)',
					outline: 'none',
					color: 'var(--ink-900)',
					transition: 'border-color .18s',
					boxSizing: 'border-box',
				}}
				onFocus={(e) => {
					e.target.style.borderColor = 'var(--violet-500)';
				}}
				onBlur={(e) => {
					e.target.style.borderColor = 'rgba(167,139,250,.3)';
				}}
			/>
		</div>
	);
}

export function AuthAlert({ tone = 'error', children, ...props }) {
	const isError = tone === 'error';
	return (
		<div
			role={isError ? 'alert' : 'status'}
			{...props}
			style={{
				marginBottom: 18,
				padding: '12px 16px',
				borderRadius: 13,
				fontSize: 13,
				fontWeight: 500,
				lineHeight: 1.5,
				background: isError
					? 'color-mix(in srgb, #f85149 10%, white)'
					: 'color-mix(in srgb, #2faa8c 12%, white)',
				border: isError ? '1px solid rgba(248,81,73,.25)' : '1px solid rgba(47,170,140,.3)',
				color: isError ? '#c0392b' : '#1f6f5a',
			}}
		>
			{children}
		</div>
	);
}
