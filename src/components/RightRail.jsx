/* RightRail.jsx — closeable widget column */
import { Icons } from '../lib/icons';
import { WIDGETS } from '../widgets/Widgets';

const ORDER = ['pomodoro', 'goal', 'calendar', 'notes', 'friends'];

export default function RightRail({ open, closeWidget, openWidget }) {
  const hidden = ORDER.filter((k) => !open.includes(k));
  return (
    <div className="scroll" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingRight: 4, height: '100%' }}>
      {ORDER.filter((k) => open.includes(k)).map((k) => {
        const W = WIDGETS[k].comp;
        return <W key={k} onClose={() => closeWidget(k)} />;
      })}

      {hidden.length > 0 && (
        <section
          className="glass glass-frost"
          style={{ borderRadius: 20, padding: 14, boxShadow: 'none', border: '1px dashed rgba(167,139,250,.4)' }}
        >
          <div className="muted" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
            Dodaj widżet
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {hidden.map((k) => (
              <button key={k} className="btn btn-ghost" style={{ fontSize: 12.5, padding: '8px 12px' }} onClick={() => openWidget(k)}>
                <Icons.plus size={14} /> {WIDGETS[k].label}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
