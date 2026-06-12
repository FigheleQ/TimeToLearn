import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../lib/icons';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signUp(email, password);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div className="glass glass-frost" style={{ borderRadius: 28, padding: 40, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>✓</span>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, letterSpacing: '-.03em' }}>
            Sprawdź skrzynkę mailową
          </h2>
          <p className="muted" style={{ margin: '0 0 24px', fontSize: 14, lineHeight: 1.5 }}>
            Wysłaliśmy link weryfikacyjny na <strong style={{ color: 'var(--ink-900)' }}>{email}</strong>
          </p>
          <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', justifyContent: 'center' }}>
            Wróć do logowania
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ width: 56, height: 56, borderRadius: 18, display: 'inline-grid', placeItems: 'center',
            background: 'linear-gradient(150deg, #a78bfa, #fb6f92)', color: '#fff',
            boxShadow: '0 18px 36px -12px rgba(167,139,250,.7)', marginBottom: 16 }}>
            <Icons.bolt size={26} stroke="#fff" />
          </span>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-.03em' }}>
            Utwórz konto
          </h1>
          <p className="muted" style={{ margin: '6px 0 0', fontSize: 14 }}>
            Dołącz i zacznij naukę z fiszkami
          </p>
        </div>

        <div className="glass glass-frost" style={{ borderRadius: 28, padding: 32 }}>

          {error && (
            <div style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 13,
              background: 'color-mix(in srgb, #f85149 10%, white)',
              border: '1px solid rgba(248,81,73,.25)',
              fontSize: 13, color: '#c0392b', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--ink-700)' }}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ty@example.com"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 13, fontSize: 14,
                  fontFamily: 'inherit', border: '1px solid rgba(167,139,250,.3)',
                  background: 'rgba(255,255,255,.6)', outline: 'none', color: 'var(--ink-900)',
                  transition: 'border-color .18s', boxSizing: 'border-box' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--violet-500)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(167,139,250,.3)'; }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--ink-700)' }}>
                Hasło
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="min. 6 znaków"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 13, fontSize: 14,
                  fontFamily: 'inherit', border: '1px solid rgba(167,139,250,.3)',
                  background: 'rgba(255,255,255,.6)', outline: 'none', color: 'var(--ink-900)',
                  transition: 'border-color .18s', boxSizing: 'border-box' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--violet-500)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(167,139,250,.3)'; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, marginTop: 4, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Rejestrowanie…' : 'Utwórz konto'}
            </button>
          </form>

          <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: 13, color: 'var(--ink-500)' }}>
            Masz już konto?{' '}
            <Link to="/login" style={{ color: 'var(--violet-600)', fontWeight: 600, textDecoration: 'none' }}>
              Zaloguj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
