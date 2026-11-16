/* TopBar.jsx — search bar, streak chip, new deck button, user avatar
 * Na telefonie: wyszukiwarka chowa się pod ikoną lupy, „Nowa talia” to sam „+”.
 * Na telefonie/tablecie dochodzi przycisk widżetów (prawy panel jest wtedy wysuwany).
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../lib/icons';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function TopBar({ toggleSidebar, menuExpanded, onOpenWidgets }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const bp = useBreakpoint();
  const isPhone = bp === 'phone';
  const [searchOpen, setSearchOpen] = useState(false);

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??';

  const searchInput = (
    <div style={{ position: 'relative', flex: 1, maxWidth: isPhone ? 'none' : 460, minWidth: 0 }}>
      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }}>
        <Icons.search size={18} />
      </span>
      <input
        data-testid="topbar-search-input"
        placeholder="Szukaj talii, fiszek…"
        aria-label="Szukaj"
        autoFocus={isPhone && searchOpen}
        style={{
          width: '100%', padding: '11px 14px 11px 42px', boxSizing: 'border-box',
          borderRadius: 13, fontSize: 14, fontFamily: 'inherit',
          border: '1px solid rgba(255,255,255,.6)',
          background: 'rgba(255,255,255,.45)',
          outline: 'none', color: 'var(--ink-900)',
        }}
      />
    </div>
  );

  // telefon: rozwinięta wyszukiwarka zajmuje cały pasek
  if (isPhone && searchOpen) {
    return (
      <header className="glass glass-frost" style={{ borderRadius: 18, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        {searchInput}
        <button className="iconbtn" onClick={() => setSearchOpen(false)} aria-label="Zamknij wyszukiwanie" style={{ flexShrink: 0 }}>
          <Icons.close size={16} />
        </button>
      </header>
    );
  }

  return (
    <header
      className="glass glass-frost"
      style={{
        borderRadius: isPhone ? 18 : 22,
        padding: isPhone ? '8px 10px' : '11px 16px',
        display: 'flex', alignItems: 'center',
        gap: isPhone ? 8 : 14,
      }}
    >
      <button
        className="iconbtn"
        data-testid="sidebar-toggle"
        onClick={toggleSidebar}
        title={isPhone ? 'Menu' : 'Zwiń / rozwiń panel'}
        aria-label={isPhone ? 'Otwórz menu' : 'Zwiń lub rozwiń panel boczny'}
        aria-expanded={menuExpanded}
        style={{ flexShrink: 0 }}
      >
        <Icons.menu size={19} />
      </button>

      {isPhone ? (
        <button
          className="iconbtn"
          data-testid="topbar-search-button"
          onClick={() => setSearchOpen(true)}
          aria-label="Szukaj"
          style={{ flexShrink: 0 }}
        >
          <Icons.search size={18} />
        </button>
      ) : (
        searchInput
      )}

      <div style={{ flex: 1 }} />

      {/* streak chip — TODO: wpiąć prawdziwe dane ze Supabase */}
      <div className="chip" style={{ gap: 7, padding: isPhone ? '7px 10px' : '8px 13px', background: 'color-mix(in srgb, #fb6f92 12%, white)', border: 'none', flexShrink: 0 }}>
        <Icons.flame size={17} stroke="#fb6f92" />
        <span style={{ fontWeight: 800, color: '#f4537a', fontSize: 14 }}>0</span>
        {!isPhone && <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>dni</span>}
      </div>

      {!isPhone && (
        <button className="iconbtn" title="Powiadomienia" aria-label="Powiadomienia" style={{ position: 'relative', flexShrink: 0 }}>
          <Icons.bell size={19} />
        </button>
      )}

      {onOpenWidgets && (
        <button
          className="iconbtn"
          data-testid="widgets-button"
          onClick={onOpenWidgets}
          title="Widżety: Pomodoro, cel dnia, notatki…"
          aria-label="Pokaż widżety"
          style={{ flexShrink: 0 }}
        >
          <Icons.grid size={18} />
        </button>
      )}

      {/* new deck button */}
      <button
        className="btn btn-primary"
        onClick={() => navigate('/flashcards')}
        aria-label="Nowa talia"
        title="Nowa talia"
        style={{ padding: isPhone ? '10px' : '10px 16px', flexShrink: 0 }}
      >
        <Icons.plus size={17} />
        {bp === 'desktop' && ' Nowa talia'}
      </button>

      {/* user avatar */}
      <span
        aria-label={user?.email}
        title={user?.email}
        style={{
          width: isPhone ? 36 : 40, height: isPhone ? 36 : 40, borderRadius: '50%',
          display: 'grid', placeItems: 'center',
          background: 'linear-gradient(150deg, #a78bfa, #7c5cff)',
          color: '#fff', fontWeight: 700, fontSize: isPhone ? 13 : 14,
          boxShadow: '0 10px 20px -8px rgba(124,92,255,.7)',
          flexShrink: 0,
        }}
      >
        {initials}
      </span>
    </header>
  );
}
