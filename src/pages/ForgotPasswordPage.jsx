/* ForgotPasswordPage.jsx — „Nie pamiętasz hasła?”: wysyłka maila z linkiem do resetu */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthShell, AuthField, AuthAlert } from '../components/AuthShell';

const linkStyle = { color: 'var(--violet-600)', fontWeight: 600, textDecoration: 'none' };

export default function ForgotPasswordPage() {
	const { resetPassword } = useAuth();
	const [email, setEmail] = useState('');
	const [sent, setSent] = useState(false);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setLoading(true);
		const { error } = await resetPassword(email.trim());
		setLoading(false);

		if (error) {
			// 429 = limit wysyłek maili w Supabase (domyślnie kilka na godzinę)
			setError(
				error.status === 429
					? 'Wysłaliśmy już kilka maili. Odczekaj chwilę i spróbuj ponownie.'
					: 'Nie udało się wysłać maila. Sprawdź adres i spróbuj ponownie.',
			);
			return;
		}
		// Ten sam komunikat niezależnie od tego, czy konto istnieje —
		// nie zdradzamy, które adresy są zarejestrowane.
		setSent(true);
	};

	if (sent) {
		return (
			<AuthShell title='Sprawdź skrzynkę' subtitle='Link do zmiany hasła jest już w drodze'>
				<AuthAlert tone='success' data-testid='reset-email-sent'>
					Jeśli konto <strong>{email.trim()}</strong> istnieje, wysłaliśmy na nie link do ustawienia
					nowego hasła. Link jest ważny przez ograniczony czas. Sprawdź też folder spam.
				</AuthAlert>
				<Link
					to='/login'
					className='btn btn-primary'
					style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', boxSizing: 'border-box' }}
				>
					Wróć do logowania
				</Link>
			</AuthShell>
		);
	}

	return (
		<AuthShell
			title='Nie pamiętasz hasła?'
			subtitle='Podaj email konta, a wyślemy link do ustawienia nowego hasła'
		>
			{error && <AuthAlert data-testid='forgot-error'>{error}</AuthAlert>}

			<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
				<AuthField
					label='Email'
					id='email'
					type='email'
					name='email'
					data-testid='forgot-email-input'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					autoComplete='email'
					placeholder='ty@example.com'
				/>
				<button
					type='submit'
					data-testid='forgot-submit-button'
					disabled={loading}
					className='btn btn-primary'
					style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 15, opacity: loading ? 0.6 : 1 }}
				>
					{loading ? 'Wysyłanie…' : 'Wyślij link'}
				</button>
			</form>

			<p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: 13, color: 'var(--ink-500)' }}>
				Pamiętasz hasło?{' '}
				<Link to='/login' style={linkStyle}>
					Zaloguj się
				</Link>
			</p>
		</AuthShell>
	);
}
