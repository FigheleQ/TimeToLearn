/* PasswordChecklist.jsx — wymagania hasła odhaczane na żywo podczas pisania */
import { Icons } from '../lib/icons';
import { checkPassword } from '../utils/passwordRules';

// confirm (opcjonalnie): drugie pole „Powtórz hasło” — dochodzi punkt „Hasła są takie same”
export default function PasswordChecklist({ password, confirm }) {
	const items = checkPassword(password);
	if (confirm !== undefined) {
		items.push({
			id: 'match',
			label: 'Hasła są takie same',
			ok: password.length > 0 && password === confirm,
		});
	}

	return (
		<ul
			data-testid='password-checklist'
			aria-label='Wymagania hasła'
			style={{
				listStyle: 'none',
				margin: 0,
				padding: '12px 14px',
				borderRadius: 13,
				background: 'rgba(255,255,255,.45)',
				border: '1px solid rgba(167,139,250,.2)',
				display: 'grid',
				gap: 6,
			}}
		>
			{items.map((item) => (
				<li
					key={item.id}
					data-testid={`password-rule-${item.id}`}
					data-ok={item.ok ? 'true' : 'false'}
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 9,
						fontSize: 13,
						fontWeight: item.ok ? 600 : 500,
						color: item.ok ? '#1f8a6c' : 'var(--ink-500)',
						transition: 'color .18s',
					}}
				>
					<span
						aria-hidden
						style={{
							width: 18,
							height: 18,
							borderRadius: 6,
							display: 'grid',
							placeItems: 'center',
							flexShrink: 0,
							background: item.ok ? 'linear-gradient(135deg, #46d6b3, #2faa8c)' : 'transparent',
							border: item.ok ? 'none' : '1.5px solid rgba(124,92,255,.35)',
							transition: 'background .18s',
						}}
					>
						{item.ok && <Icons.check size={12} stroke='#fff' sw={2.6} />}
					</span>
					<span>{item.label}</span>
					<span className='sr-only' style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
						{item.ok ? '(spełnione)' : '(niespełnione)'}
					</span>
				</li>
			))}
		</ul>
	);
}
