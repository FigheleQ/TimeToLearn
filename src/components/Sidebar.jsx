/* Sidebar.jsx — left navigation rail with real auth */
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../lib/icons';

const SECTIONS = [
  { id: 'home',      label: 'Pulpit',      icon: 'grid',     path: '/' },
  { id: 'habits',    label: 'Tracker',     icon: 'flame',    path: '/habits' },
  { id: 'flashcards',label: 'Fiszki',      icon: 'cards',    path: '/flashcards' },
  { id: 'stats',     label: 'Statystyki',  icon: 'chart',    path: '/stats' },
];

export default function Sidebar({ collapsed, active, setActive }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const currentId = SECTIONS.find((s) => s.path === location.pathname)?.id ?? active;

  return (
    <aside
      className="glass glass-frost"
      style={{
        borderRadius: 26,
        padding: collapsed ? '20px 12px' : 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        height: '100%',
      }}
    >
      {/* logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: collapsed ? '0 0 14px' : '4px 8px 16px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <span
          style={{
            width: 38, height: 38, borderRadius: 12,
            display: 'grid', placeItems: 'center', flexShrink: 0,
            background: 'linear-gradient(150deg, #a78bfa, #fb6f92)',
            color: '#fff',
            boxShadow: '0 10px 22px -8px rgba(167,139,250,.8)',
          }}
        >
          <Icons.bolt size={21} stroke="#fff" />
        </span>
        {!collapsed && (
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.03em' }}>
            TimeToLearn
          </span>
        )}
      </div>

      {/* nav links */}
      {SECTIONS.map((s) => {
        const I = Icons[s.icon];
        const on = currentId === s.id;
        return (
          <button
            key={s.id}
            onClick={() => { setActive(s.id); navigate(s.path); }}
            title={s.label}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '11px' : '11px 13px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 13, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 14, fontWeight: on ? 700 : 600,
              color: on ? '#fff' : 'var(--ink-700)',
              background: on ? 'linear-gradient(150deg, var(--violet-500), var(--violet-600))' : 'transparent',
              boxShadow: on ? '0 12px 24px -10px rgba(124,92,255,.7)' : 'none',
              transition: 'background .18s, color .18s',
            }}
            onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'rgba(255,255,255,.5)'; }}
            onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}
          >
            <I size={20} stroke={on ? '#fff' : 'currentColor'} />
            {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{s.label}</span>}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* pro upsell */}
      {!collapsed && (
        <div
          className="glass glass-frost"
          style={{ borderRadius: 18, padding: 15, boxShadow: 'none', border: '1px solid rgba(255,255,255,.6)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Icons.sparkle size={17} stroke="#7c5cff" />
            <span style={{ fontSize: 13, fontWeight: 700 }}>TimeToLearn Pro</span>
          </div>
          <p className="muted" style={{ margin: '0 0 11px', fontSize: 12, lineHeight: 1.45 }}>
            Nielimitowane talie i statystyki AI.
          </p>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '9px' }}>
            Odblokuj
          </button>
        </div>
      )}

      {/* sign out */}
      <button
        onClick={handleSignOut}
        title="Wyloguj"
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: collapsed ? '11px' : '11px 13px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 13, border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
          color: 'var(--ink-400)',
          background: 'transparent',
          transition: 'background .18s, color .18s',
          marginTop: 4,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,81,73,.08)'; e.currentTarget.style.color = '#f85149'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-400)'; }}
      >
        <Icons.logout size={20} />
        {!collapsed && <span>Wyloguj</span>}
      </button>
    </aside>
  );
}
