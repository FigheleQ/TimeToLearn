/* TopBar.jsx — search bar, streak chip, new deck button, user avatar */
import { useAuth } from '../context/AuthContext';
import { Icons } from '../lib/icons';

export default function TopBar({ toggleSidebar }) {
  const { user } = useAuth();

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??';

  return (
    <header
      className="glass glass-frost"
      style={{ borderRadius: 22, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 14 }}
    >
      <button className="iconbtn" onClick={toggleSidebar} title="Zwiń panel">
        <Icons.menu size={19} />
      </button>

      {/* search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 460 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }}>
          <Icons.search size={18} />
        </span>
        <input
          placeholder="Szukaj talii, fiszek…"
          style={{
            width: '100%', padding: '11px 14px 11px 42px',
            borderRadius: 13, fontSize: 14, fontFamily: 'inherit',
            border: '1px solid rgba(255,255,255,.6)',
            background: 'rgba(255,255,255,.45)',
            outline: 'none', color: 'var(--ink-900)',
          }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* streak chip — TODO: wpiąć prawdziwe dane ze Supabase */}
      <div className="chip" style={{ gap: 7, padding: '8px 13px', background: 'color-mix(in srgb, #fb6f92 12%, white)', border: 'none' }}>
        <Icons.flame size={17} stroke="#fb6f92" />
        <span style={{ fontWeight: 800, color: '#f4537a', fontSize: 14 }}>0</span>
        <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>dni</span>
      </div>

      <button className="iconbtn" title="Powiadomienia" style={{ position: 'relative' }}>
        <Icons.bell size={19} />
      </button>

      {/* new deck button */}
      <button className="btn btn-primary" style={{ padding: '10px 16px' }}>
        <Icons.plus size={17} /> Nowa talia
      </button>

      {/* user avatar */}
      <span
        style={{
          width: 40, height: 40, borderRadius: '50%',
          display: 'grid', placeItems: 'center',
          background: 'linear-gradient(150deg, #a78bfa, #7c5cff)',
          color: '#fff', fontWeight: 700, fontSize: 14,
          boxShadow: '0 10px 20px -8px rgba(124,92,255,.7)',
          flexShrink: 0,
        }}
      >
        {initials}
      </span>
    </header>
  );
}
