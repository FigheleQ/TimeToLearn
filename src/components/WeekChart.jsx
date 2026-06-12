/* WeekChart.jsx — mini weekly study-minutes bar chart */

// TODO: zastąp statyczne dane danymi z Supabase (pomodoro_logs)
const WEEK = [
  { d: 'Pn', v: 0 }, { d: 'Wt', v: 0 }, { d: 'Śr', v: 0 },
  { d: 'Cz', v: 0 }, { d: 'Pt', v: 0 }, { d: 'So', v: 0 }, { d: 'Nd', v: 0 },
];

export default function WeekChart({ data = WEEK }) {
  const max = Math.max(...data.map((w) => w.v), 1);
  const today = new Date().getDay();
  const dayIndex = today === 0 ? 6 : today - 1;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9, height: 84 }}>
      {data.map((w, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
          <div style={{ width: '100%', height: 64, display: 'flex', alignItems: 'flex-end' }}>
            <div
              title={`${w.v} min`}
              style={{
                width: '100%',
                height: `${Math.max((w.v / max) * 100, 4)}%`,
                borderRadius: 8,
                background: i === dayIndex
                  ? 'linear-gradient(180deg,#fb6f92,#f4537a)'
                  : 'linear-gradient(180deg,#bda6ff,#8b6cf6)',
                boxShadow: i === dayIndex ? '0 8px 16px -6px rgba(251,111,146,.6)' : 'none',
                transition: 'height .5s cubic-bezier(.2,.8,.2,1)',
                opacity: w.v === 0 ? 0.3 : 1,
              }}
            />
          </div>
          <span className="muted" style={{ fontSize: 11, fontWeight: 600 }}>{w.d}</span>
        </div>
      ))}
    </div>
  );
}
