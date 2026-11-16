/* ResetPasswordPage.jsx — ustawienie nowego hasła po kliknięciu linku z maila
 *
 * Link z maila otwiera /reset-password z tokenem w adresie. Klient Supabase zamienia go na sesję,
 * zanim AuthProvider wyrenderuje stronę — więc tutaj wystarczy sprawdzić, czy jest `user`.
 * Brak sesji = link wygasł, został już użyty albo ktoś wszedł tu bezpośrednio.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthShell, AuthField, AuthAlert } from '../components/AuthShell';
import PasswordChecklist from '../components/PasswordChecklist';
import { isPasswordStrong } from '../utils/passwordRules';

// czytelne komunikaty dla błędów, które Supabase zwraca przy zmianie hasła
function friendlyError(error) {
	if (error.code === 'same_password') return 'Nowe hasło musi się różnić od poprzedniego.';
	if (error.code === 'weak_password') return 'Hasło jest za słabe. Spełnij wszystkie wymagania z listy.';
	if (
		error.status === 401 ||
		error.code === 'session_not_found' ||
		error.name === 'AuthSessionMissingError'
	)
		return 'Link wygasł. Poproś o nowy link do zmiany hasła.';
	return 'Nie udało się zmienić hasła. Spróbuj ponownie.';
}

export default function ResetPasswordPage() {
	const { user, updatePassword } = useAuth();
	const navigate = useNavigate();
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [done, setDone] = useState(false);

	const canSubmit = isPasswordStrong(password) && password === confirm && !loading;

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!canSubmit) return;
		setError(null);
		setLoading(true);
		const { error } = await updatePassword(password);
		setLoading(false);
		if (error) {
			setError(friendlyError(error));
			return;
		}
		setDone(true);
	};

	if (done) {
		return (
			<AuthShell title='Hasło zmienione' subtitle='Od teraz logujesz się nowym hasłem'>
				<AuthAlert tone='success' data-testid='password-updated'>
					Gotowe! Twoje hasło zostało zmienione i jesteś zalogowany.
				</AuthAlert>
				<button
					type='button'
					data-testid='go-to-app-button'
					className='btn btn-primary'
					style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 15 }}
					onClick={() => navigate('/', { replace: true })}
				>
					Przejdź do aplikacji
				</button>
			</AuthShell>
		);
	}

	if (!user) {
		return (
			<AuthShell title='Link nieaktywny' subtitle='Nie możemy zmienić hasła z tego linku'>
				<AuthAlert data-testid='reset-link-invalid'>
					Link do zmiany hasła wygasł, został już użyty albo jest niepełny. Poproś o nowy — wyślemy
					go na Twój email.
				</AuthAlert>
				<Link
					to='/forgot-password'
					className='btn btn-primary'
					style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', boxSizing: 'border-box' }}
				>
					Wyślij nowy link
				</Link>
				<p style={{ margin: '16px 0 0', textAlign: 'center', fontSize: 13 }}>
					<Link to='/login' style={{ color: 'var(--violet-600)', fontWeight: 600, textDecoration: 'none' }}>
						Wróć do logowania
					</Link>
				</p>
			</AuthShell>
		);
	}

	return (
		<AuthShell title='Ustaw nowe hasło' subtitle={`Konto: ${user.email}`}>
			{error && <AuthAlert data-testid='reset-error'>{error}</AuthAlert>}

			<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
				<AuthField
					label='Nowe hasło'
					id='new-password'
					type='password'
					name='new-password'
					data-testid='new-password-input'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					autoComplete='new-password'
					placeholder='••••••••'
				/>
				<AuthField
					label='Powtórz nowe hasło'
					id='confirm-password'
					type='password'
					name='confirm-password'
					data-testid='confirm-password-input'
					value={confirm}
					onChange={(e) => setConfirm(e.target.value)}
					required
					autoComplete='new-password'
					placeholder='••••••••'
				/>
				<PasswordChecklist password={password} confirm={confirm} />
				<button
					type='submit'
					data-testid='reset-submit-button'
					disabled={!canSubmit}
					className='btn btn-primary'
					style={{
						width: '100%',
						justifyContent: 'center',
						padding: 13,
						fontSize: 15,
						opacity: canSubmit ? 1 : 0.55,
						cursor: canSubmit ? 'pointer' : 'not-allowed',
					}}
				>
					{loading ? 'Zapisywanie…' : 'Zmień hasło'}
				</button>
			</form>
		</AuthShell>
	);
}
