/* AppLayout.jsx — authenticated shell: sidebar + topbar + main + right rail */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import RightRail from './RightRail';

const GLASS_PRESETS = {
  subtle:  { '--glass-blur': '7px',  '--glass-alpha-top': '0.86', '--glass-alpha-bot': '0.66', '--glass-border': '0.8',  '--glass-sat': '125%' },
  strong:  { '--glass-blur': '15px', '--glass-alpha-top': '0.74', '--glass-alpha-bot': '0.46', '--glass-border': '0.72', '--glass-sat': '160%' },
  max:     { '--glass-blur': '26px', '--glass-alpha-top': '0.62', '--glass-alpha-bot': '0.3',  '--glass-border': '0.62', '--glass-sat': '190%' },
  liquid:  { '--glass-blur': '22px', '--glass-alpha-top': '0.09', '--glass-alpha-bot': '0.09', '--glass-border': '0.55', '--glass-sat': '130%' },
};

export default function AppLayout() {
  const [active, setActive] = useState('home');
  const [open, setOpen] = useState(['pomodoro', 'goal', 'calendar', 'notes', 'friends']);
  const [collapsed, setCollapsed] = useState(false);
  const [glass] = useState('liquid');

  const sideW = collapsed ? 78 : 248;
  const railOpen = open.length > 0;
  const preset = GLASS_PRESETS[glass];

  return (
    <div
      style={{
        height: '100vh',
        padding: 18,
        display: 'grid',
        gap: 16,
        gridTemplateColumns: `${sideW}px minmax(0,1fr)${railOpen ? ' 348px' : ''}`,
        gridTemplateRows: 'auto minmax(0,1fr)',
        ...Object.fromEntries(Object.entries(preset).map(([k, v]) => [k, v])),
      }}
    >
      {/* sidebar — spans both rows */}
      <div style={{ gridColumn: '1', gridRow: '1 / 3' }}>
        <Sidebar collapsed={collapsed} active={active} setActive={setActive} />
      </div>

      {/* topbar — spans across main + rail columns */}
      <div style={{ gridColumn: railOpen ? '2 / 4' : '2', gridRow: '1' }}>
        <TopBar toggleSidebar={() => setCollapsed((c) => !c)} />
      </div>

      {/* main content — page renders here via <Outlet> */}
      <div style={{ gridColumn: '2', gridRow: '2', minHeight: 0 }}>
        <Outlet />
      </div>

      {/* right rail — optional widgets */}
      {railOpen && (
        <div style={{ gridColumn: '3', gridRow: '2', minHeight: 0 }}>
          <RightRail
            open={open}
            closeWidget={(k) => setOpen(open.filter((x) => x !== k))}
            openWidget={(k) => setOpen([...open, k])}
          />
        </div>
      )}
    </div>
  );
}
