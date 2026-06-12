/* DeckCard.jsx — karta talii na dashboardzie */
import { Icons } from '../lib/icons';

export default function DeckCard({ deck, onOpen, onDelete }) {
  const count = deck.flashcards?.[0]?.count ?? 0;

  return (
    <div
      data-tilt
      className="glass glass-frost"
      style={{
        borderRadius: 20,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        cursor: 'pointer',
      }}
      onClick={onOpen}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)', lineHeight: 1.3 }}>
            {deck.title}
          </div>
          {deck.subject && (
            <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>{deck.subject}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {onDelete && (
            <button
              className="iconbtn"
              style={{ width: 30, height: 30 }}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="Usuń talię"
            >
              <Icons.close size={13} />
            </button>
          )}
          <span
            style={{
              width: 34, height: 34, borderRadius: 10,
              display: 'grid', placeItems: 'center',
              background: 'rgba(167,139,250,.12)', color: 'var(--violet-500)',
            }}
          >
            <Icons.cards size={17} />
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 'auto' }}>
        <span className="chip" style={{ fontSize: 11.5 }}>{count} fiszek</span>
        <button
          className="btn btn-primary"
          style={{ fontSize: 13, padding: '8px 14px', marginLeft: 'auto' }}
          onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
        >
          <Icons.play size={14} /> Ucz się
        </button>
      </div>
    </div>
  );
}
