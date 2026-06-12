/* icons.jsx — clean stroked UI icons (Apple-ish, 24 grid, rounded) */
const Ic = ({ d, size = 22, fill, stroke = "currentColor", sw = 1.8, children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"}
       stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {d ? <path d={d} /> : children}
  </svg>
);

export const Icons = {
  grid:    (p) => <Ic {...p}><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></Ic>,
  cards:   (p) => <Ic {...p}><rect x="3" y="6" width="14" height="12" rx="2.5"/><path d="M7 3.5h11a2.5 2.5 0 0 1 2.5 2.5v9"/></Ic>,
  bolt:    (p) => <Ic {...p} d="M13 2 4.5 13.5H11l-1 8.5 9-12h-6.5z"/>,
  chart:   (p) => <Ic {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></Ic>,
  calendar:(p) => <Ic {...p}><rect x="3.5" y="4.5" width="17" height="16" rx="3"/><path d="M3.5 9.5h17M8 2.5v4M16 2.5v4"/></Ic>,
  gear:    (p) => <Ic {...p}><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.05.05a2 2 0 1 1-2.83 2.83l-.05-.05a1.7 1.7 0 0 0-2.87 1.2V21a2 2 0 1 1-4 0v-.07A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.87.34l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05A1.7 1.7 0 0 0 2.6 14 1.7 1.7 0 0 0 1 12.93H1a2 2 0 1 1 0-4h.07A1.7 1.7 0 0 0 2.6 7.6a1.7 1.7 0 0 0-.34-1.87l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05A1.7 1.7 0 0 0 7 2.6h.06A1.7 1.7 0 0 0 8.13 1H8a2 2 0 1 1 4 0v.07a1.7 1.7 0 0 0 1 1.53 1.7 1.7 0 0 0 1.87-.34l.05-.05a2 2 0 1 1 2.83 2.83l-.05.05A1.7 1.7 0 0 0 21.4 7.6V7.6a1.7 1.7 0 0 0 1.53 1H23a2 2 0 1 1 0 4h-.07a1.7 1.7 0 0 0-1.53 1z"/></Ic>,
  search:  (p) => <Ic {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></Ic>,
  flame:   (p) => <Ic {...p} d="M12 2.5c.8 3.2-1.8 4.3-1.8 7 0 1 .6 1.8 1.4 1.8-1.7.5-4.6 2.2-4.6 5.7A5.6 5.6 0 0 0 12 22.5a5.6 5.6 0 0 0 5-8.4c-.8-1.5-2-2-2-3.4 0-2 1-2.6 1-4.2C16 4 14 3 12 2.5z"/>,
  bell:    (p) => <Ic {...p}><path d="M18 8.5a6 6 0 0 0-12 0c0 6.5-2.5 8-2.5 8h17S18 15 18 8.5z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/></Ic>,
  plus:    (p) => <Ic {...p} d="M12 5v14M5 12h14"/>,
  play:    (p) => <Ic {...p} d="M7 5.5 18.5 12 7 18.5z" fill="currentColor" stroke="none"/>,
  pause:   (p) => <Ic {...p}><rect x="7" y="5.5" width="3.4" height="13" rx="1.4" fill="currentColor" stroke="none"/><rect x="13.6" y="5.5" width="3.4" height="13" rx="1.4" fill="currentColor" stroke="none"/></Ic>,
  reset:   (p) => <Ic {...p}><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3 3.5V9h5.5"/></Ic>,
  note:    (p) => <Ic {...p}><path d="M5 3.5h9l5 5v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z"/><path d="M13.5 3.5V9H19M8 13h8M8 17h5"/></Ic>,
  target:  (p) => <Ic {...p}><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1" fill="currentColor"/></Ic>,
  users:   (p) => <Ic {...p}><circle cx="9" cy="8" r="3.4"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a3.2 3.2 0 0 1 0 6.2M17.5 20a5.3 5.3 0 0 0-3-4.8"/></Ic>,
  close:   (p) => <Ic {...p} d="M6 6l12 12M18 6 6 18"/>,
  chevR:   (p) => <Ic {...p} d="M9 6l6 6-6 6"/>,
  chevL:   (p) => <Ic {...p} d="M15 6l-6 6 6 6"/>,
  check:   (p) => <Ic {...p} d="M5 12.5l4.5 4.5L19 6.5"/>,
  rotate:  (p) => <Ic {...p}><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/></Ic>,
  clock:   (p) => <Ic {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></Ic>,
  sparkle: (p) => <Ic {...p} d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>,
  book:    (p) => <Ic {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5z"/></Ic>,
  globe:   (p) => <Ic {...p}><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17"/></Ic>,
  atom:    (p) => <Ic {...p}><circle cx="12" cy="12" r="1.6" fill="currentColor"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/></Ic>,
  scroll2: (p) => <Ic {...p}><path d="M5 4h11v15a2 2 0 0 1-2 2H6"/><path d="M16 4a2 2 0 0 1 2 2v2h-2M8 21a2 2 0 0 1-2-2V6"/><path d="M8.5 8.5h4M8.5 12h4"/></Ic>,
  sum:     (p) => <Ic {...p} d="M17 5H7l5 7-5 7h10"/>,
  menu:    (p) => <Ic {...p} d="M4 7h16M4 12h16M4 17h16"/>,
  logout:  (p) => <Ic {...p}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></Ic>,
};
