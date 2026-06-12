/* Widgets.jsx — right rail widgets. Each is closeable via onClose. */
import { useState, useEffect, useRef } from 'react';
import { Icons } from '../lib/icons';
import { createPomodoroLog } from '../services/supabase';

// Placeholder friend/upcoming data — TODO: wpiąć z Supabase
const FRIENDS = [
  { name: 'Kasia W.',  color: '#fb6f92', streak: 31, status: 'uczy się — Anatomia', online: true },
  { name: 'Bartek N.', color: '#6fb6ff', streak: 12, status: 'ukończył 60 fiszek',  online: true },
  { name: 'Ola P.',    color: '#46d6b3', streak: 8,  status: '2 godz. temu',        online: false },
];

const UPCOMING = [
  { day: 'Dziś',   label: 'Angielski A2', count: 0, accent: '#a78bfa' },
  { day: 'Jutro',  label: 'Matematyka',   count: 0, accent: '#7c5cff' },
];

/* ---- shared ring SVG ---- */
export function Ring({ size = 56, stroke = 7, value = 0, color = 'var(--violet-500)', track = 'rgba(167,139,250,.18)', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - value)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{children}</div>
    </div>
  );
}

/* ---- widget shell (header + close button) ---- */
export function WidgetShell({ icon, title, accent = 'var(--violet-500)', onClose, children, right }) {
  const I = Icons[icon];
  return (
    <section data-tilt className="glass glass-frost widget" style={{ padding: 16, borderRadius: 22, animation: 'pop .35s cubic-bezier(.2,.9,.2,1)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, display: 'grid', placeItems: 'center',
          background: `color-mix(in srgb, ${accent} 16%, white)`, color: accent }}>
          <I size={17} />
        </span>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: '-.01em', flex: 1 }}>{title}</h3>
        {right}
        {onClose && (
          <button className="iconbtn" style={{ width: 28, height: 28 }} onClick={onClose} title="Zamknij widżet">
            <Icons.close size={14} />
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

/* ---- Pomodoro ---- */
export function PomodoroWidget({ onClose }) {
  const FOCUS = 25 * 60;
  const [left, setLeft] = useState(FOCUS);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const tick = useRef(null);
  const prevDone = useRef(0);

  useEffect(() => {
    if (running) {
      tick.current = setInterval(() => setLeft((s) => {
        if (s <= 1) { setRunning(false); setDone((d) => d + 1); return FOCUS; }
        return s - 1;
      }), 1000);
    }
    return () => clearInterval(tick.current);
  }, [running]);

  // Osobny effect — odpala się gdy done wzrośnie (sesja skończona)
  // Dzięki temu createPomodoroLog nie jest side-effectem w state-updaterze
  useEffect(() => {
    if (done > prevDone.current) {
      prevDone.current = done;
      createPomodoroLog(25).then(() => {
        window.dispatchEvent(new CustomEvent('pomodoro-complete'));
      });
    }
  }, [done]);

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const prog = 1 - left / FOCUS;
  const elapsed = FOCUS - left; // sekundy które upłynęły

  const handleStop = () => {
    setRunning(false);
    const minutes = Math.max(1, Math.round(elapsed / 60));
    setLeft(FOCUS);
    createPomodoroLog(minutes).then(() => {
      window.dispatchEvent(new CustomEvent('pomodoro-complete'));
    });
  };

  return (
    <WidgetShell icon="clock" title="Pomodoro" accent="#fb6f92" onClose={onClose}
      right={<span className="chip" style={{ fontSize: 11, padding: '3px 9px' }}>Sesja {done + 1}</span>}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Ring size={92} stroke={9} value={prog} color="#fb6f92" track="rgba(251,111,146,.16)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-.04em', fontVariantNumeric: 'tabular-nums' }}>{mm}:{ss}</div>
            <div className="muted" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em' }}>skupienie</div>
          </div>
        </Ring>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <button className={running ? 'btn btn-ghost' : 'btn btn-coral'} style={{ justifyContent: 'center' }}
            onClick={() => setRunning((r) => !r)}>
            {running ? <Icons.pause size={16} /> : <Icons.play size={16} />}
            {running ? 'Pauza' : 'Start'}
          </button>
          {elapsed >= 60 ? (
            <button className="btn btn-coral" style={{ justifyContent: 'center' }} onClick={handleStop}>
              <Icons.check size={15} /> Zapisz ({Math.max(1, Math.round(elapsed / 60))} min)
            </button>
          ) : (
            <button className="btn btn-ghost" style={{ justifyContent: 'center' }}
              onClick={() => { setRunning(false); setLeft(FOCUS); }}>
              <Icons.reset size={15} /> Reset
            </button>
          )}
          <div style={{ display: 'flex', gap: 5, marginTop: 2, justifyContent: 'center' }}>
            {[0,1,2,3].map((i) => (
              <span key={i} style={{ width: 8, height: 8, borderRadius: 99,
                background: i < done ? '#fb6f92' : 'rgba(251,111,146,.22)' }} />
            ))}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}

/* ---- Quick notes ---- */
export function NotesWidget({ onClose }) {
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ttl_notes')) || []; }
    catch { return []; }
  });
  const [val, setVal] = useState('');
  useEffect(() => { localStorage.setItem('ttl_notes', JSON.stringify(notes)); }, [notes]);
  const add = () => { if (val.trim()) { setNotes([val.trim(), ...notes]); setVal(''); } };

  return (
    <WidgetShell icon="note" title="Szybkie notatki" accent="#7c5cff" onClose={onClose}>
      <div style={{ display: 'flex', gap: 7, marginBottom: 11 }}>
        <input value={val} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Zapisz myśl…"
          style={{ flex: 1, border: '1px solid rgba(167,139,250,.25)', background: 'rgba(255,255,255,.6)',
            borderRadius: 11, padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: 'var(--ink-900)' }} />
        <button className="iconbtn" style={{ width: 36, height: 36, background: 'rgba(124,92,255,.12)', color: 'var(--violet-600)' }} onClick={add}>
          <Icons.plus size={17} />
        </button>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 132, overflow: 'auto' }} className="scroll">
        {notes.map((n, i) => (
          <li key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13, lineHeight: 1.35,
            background: 'rgba(255,255,255,.45)', borderRadius: 11, padding: '9px 11px', border: '1px solid rgba(255,255,255,.5)' }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: '#7c5cff', marginTop: 6, flexShrink: 0 }} />
            <span style={{ flex: 1, color: 'var(--ink-700)' }}>{n}</span>
            <button className="iconbtn" style={{ width: 22, height: 22, border: 'none', background: 'transparent', color: 'var(--ink-300)' }}
              onClick={() => setNotes(notes.filter((_, j) => j !== i))}><Icons.close size={13} /></button>
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}

/* ---- Upcoming reviews ---- */
export function CalendarWidget({ onClose }) {
  return (
    <WidgetShell icon="calendar" title="Nadchodzące powtórki" accent="#6fb6ff" onClose={onClose}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {UPCOMING.map((u, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 11,
            background: 'rgba(255,255,255,.45)', borderRadius: 12, padding: '9px 11px', border: '1px solid rgba(255,255,255,.5)' }}>
            <span style={{ width: 42, fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{u.day}</span>
            <span style={{ width: 4, height: 26, borderRadius: 99, background: u.accent }} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{u.label}</span>
            <span className="chip" style={{ background: `color-mix(in srgb, ${u.accent} 14%, white)`, color: u.accent, border: 'none', fontSize: 11.5 }}>{u.count}</span>
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}

/* ---- Daily goal ---- */
export function GoalWidget({ onClose, doneCount = 0, goal = 50 }) {
  const v = Math.min(1, doneCount / goal);
  return (
    <WidgetShell icon="target" title="Cel dnia" accent="#46d6b3" onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Ring size={74} stroke={9} value={v} color="#46d6b3" track="rgba(70,214,179,.16)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.03em' }}>{Math.round(v*100)}%</div>
          </div>
        </Ring>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{doneCount} / {goal} fiszek</div>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 3, lineHeight: 1.4 }}>
            Jeszcze <b style={{ color: '#2faa8c' }}>{goal - doneCount}</b> powtórek do zamknięcia dnia.
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}

/* ---- Friends ---- */
export function FriendsWidget({ onClose }) {
  return (
    <WidgetShell icon="users" title="Znajomi" accent="#a78bfa" onClose={onClose}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {FRIENDS.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ position: 'relative' }}>
              <span style={{ width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center',
                background: `linear-gradient(150deg, ${f.color}, color-mix(in srgb, ${f.color} 55%, #7c5cff))`,
                color: '#fff', fontSize: 13, fontWeight: 700 }}>
                {f.name.split(' ').map((s) => s[0]).join('').slice(0,2)}
              </span>
              {f.online && <span style={{ position: 'absolute', right: -1, bottom: -1, width: 11, height: 11, borderRadius: 99, background: '#46d6b3', border: '2px solid #fff' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{f.name}</div>
              <div className="muted" style={{ fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.status}</div>
            </div>
            <span className="chip" style={{ fontSize: 11, padding: '3px 8px', gap: 4 }}>
              <Icons.flame size={12} stroke="#fb6f92" /> {f.streak}
            </span>
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}

export const WIDGETS = {
  pomodoro: { comp: PomodoroWidget, label: 'Pomodoro' },
  notes:    { comp: NotesWidget,    label: 'Notatki' },
  calendar: { comp: CalendarWidget, label: 'Kalendarz' },
  goal:     { comp: GoalWidget,     label: 'Cel dnia' },
  friends:  { comp: FriendsWidget,  label: 'Znajomi' },
};
