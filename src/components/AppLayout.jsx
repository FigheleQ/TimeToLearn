/* AppLayout.jsx — authenticated shell: sidebar + topbar + main + right rail
 *
 * Układ zależy od szerokości ekranu (hooks/useBreakpoint):
 *   desktop (≥1200) — sidebar | treść | widżety, jak dotąd
 *   tablet  (768–1199) — sidebar zwinięty do ikon | treść; widżety w panelu wysuwanym z prawej
 *   phone   (<768) — sama treść; menu wysuwane z lewej (☰), widżety z prawej
 */
import { useCallback, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import RightRail from './RightRail';
import WhatsNewModal from './WhatsNewModal';
import Drawer from './Drawer';
import { useBreakpoint } from '../hooks/useBreakpoint';

const GLASS_PRESETS = {
  subtle:  { '--glass-blur': '7px',  '--glass-alpha-top': '0.86', '--glass-alpha-bot': '0.66', '--glass-border': '0.8',  '--glass-sat': '125%' },
  strong:  { '--glass-blur': '15px', '--glass-alpha-top': '0.74', '--glass-alpha-bot': '0.46', '--glass-border': '0.72', '--glass-sat': '160%' },
  max:     { '--glass-blur': '26px', '--glass-alpha-top': '0.62', '--glass-alpha-bot': '0.3',  '--glass-border': '0.62', '--glass-sat': '190%' },
  liquid:  { '--glass-blur': '22px', '--glass-alpha-top': '0.09', '--glass-alpha-bot': '0.09', '--glass-border': '0.55', '--glass-sat': '130%' },
};

export default function AppLayout() {
  const bp = useBreakpoint();
  const isPhone = bp === 'phone';
  const isDesktop = bp === 'desktop';
  const location = useLocation();

  const [active, setActive] = useState('home');
  const [open, setOpen] = useState(['pomodoro', 'goal', 'calendar', 'notes', 'friends']);
  // zwinięcie sidebara pamiętane osobno: na komputerze domyślnie rozwinięty, na tablecie zwinięty
  const [collapsedDesktop, setCollapsedDesktop] = useState(false);
  const [collapsedTablet, setCollapsedTablet] = useState(true);
  // Panel pamięta, na której stronie i przy jakim ekranie go otwarto. Zmiana strony
  // albo szerokości (np. obrót telefonu) sprawia, że przestaje być "otwarty" — bez efektów.
  const here = `${location.pathname}|${bp}`;
  const [navOpenAt, setNavOpenAt] = useState(null);         // menu na telefonie
  const [widgetsOpenAt, setWidgetsOpenAt] = useState(null); // widżety na telefonie/tablecie
  const navOpen = navOpenAt === here;
  const widgetsOpen = widgetsOpenAt === here;
  const [glass] = useState('liquid');

  const closeNav = useCallback(() => setNavOpenAt(null), []);
  const closeWidgets = useCallback(() => setWidgetsOpenAt(null), []);

  const collapsed = isDesktop ? collapsedDesktop : collapsedTablet;
  const toggleSidebar = () => {
    if (isPhone) setNavOpenAt(navOpen ? null : here);
    else if (isDesktop) setCollapsedDesktop((c) => !c);
    else setCollapsedTablet((c) => !c);
  };

  const sideW = collapsed ? 78 : 248;
  const railInGrid = isDesktop && open.length > 0;
  const preset = GLASS_PRESETS[glass];

  const columns = isPhone
    ? 'minmax(0,1fr)'
    : `${sideW}px minmax(0,1fr)${railInGrid ? ' 348px' : ''}`;

  const rail = (
    <RightRail
      open={open}
      closeWidget={(k) => setOpen(open.filter((x) => x !== k))}
      openWidget={(k) => setOpen([...open, k])}
    />
  );

  return (
    <div
      className='app-shell'
      data-breakpoint={bp}
      style={{
        padding: isPhone ? 10 : bp === 'tablet' ? 14 : 18,
        paddingTop: isPhone ? 'max(10px, env(safe-area-inset-top))' : undefined,
        paddingBottom: isPhone ? 'max(10px, env(safe-area-inset-bottom))' : undefined,
        boxSizing: 'border-box',
        display: 'grid',
        gap: isPhone ? 10 : 16,
        gridTemplateColumns: columns,
        gridTemplateRows: 'auto minmax(0,1fr)',
        ...preset,
      }}
    >
      <WhatsNewModal />

      {/* sidebar — kolumna na tablecie/komputerze, wysuwane menu na telefonie */}
      {isPhone ? (
        <Drawer open={navOpen} onClose={closeNav} side='left' width={290} label='Menu' testId='nav-drawer'>
          <Sidebar collapsed={false} active={active} setActive={setActive} />
        </Drawer>
      ) : (
        <div style={{ gridColumn: '1', gridRow: '1 / 3', minHeight: 0 }}>
          <Sidebar collapsed={collapsed} active={active} setActive={setActive} />
        </div>
      )}

      {/* topbar — nad treścią (i nad widżetami na komputerze) */}
      <div style={{ gridColumn: isPhone ? '1' : railInGrid ? '2 / 4' : '2', gridRow: '1', minWidth: 0 }}>
        <TopBar
          toggleSidebar={toggleSidebar}
          menuExpanded={isPhone ? navOpen : !collapsed}
          onOpenWidgets={isDesktop ? null : () => setWidgetsOpenAt(here)}
        />
      </div>

      {/* main content — page renders here via <Outlet> */}
      <main style={{ gridColumn: isPhone ? '1' : '2', gridRow: '2', minHeight: 0, minWidth: 0 }}>
        <Outlet />
      </main>

      {/* widżety — kolumna na komputerze, wysuwany panel na tablecie/telefonie */}
      {isDesktop ? (
        railInGrid && <div style={{ gridColumn: '3', gridRow: '2', minHeight: 0 }}>{rail}</div>
      ) : (
        <Drawer open={widgetsOpen} onClose={closeWidgets} side='right' width={380} label='Widżety' testId='widgets-drawer'>
          {rail}
        </Drawer>
      )}
    </div>
  );
}
