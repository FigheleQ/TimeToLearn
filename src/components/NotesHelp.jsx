/* NotesHelp.jsx — pomoc modułu Notatki
 *   <NotesHelpPanel />          — zwijany panel na liście folderów (pamięta, czy jest zwinięty)
 *   <NotesHelpButton view=… />  — przycisk „?” otwierający pomoc w okienku (folder, edytor)
 */
import { useState } from 'react';
import { Icons } from '../lib/icons';
import ConfirmModal from './ConfirmModal';
import { NOTES_HELP } from '../config/notesHelp';

const STORAGE_KEY = 'ttl:notes-help-collapsed';

// localStorage bywa niedostępny (tryb prywatny, zablokowane dane) — wtedy po prostu nie pamiętamy.
// Brak zapisanej decyzji → wartość domyślna (zwinięty, gdy użytkownik ma już foldery).
function readCollapsed(defaultCollapsed) {
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		return stored === null ? defaultCollapsed : stored === '1';
	} catch {
		return defaultCollapsed;
	}
}
function writeCollapsed(value) {
	try {
		window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
	} catch {
		/* brak pamięci — trudno */
	}
}

// sekcje istotne dla danego widoku idą na początek
function sectionsFor(view) {
	if (!view) return NOTES_HELP;
	const first = NOTES_HELP.filter((s) => s.focus.includes(view));
	const rest = NOTES_HELP.filter((s) => !s.focus.includes(view));
	return [...first, ...rest];
}

function HelpSections({ view }) {
	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
				gap: 14,
			}}
		>
			{sectionsFor(view).map((section) => (
				<section key={section.id} data-testid='notes-help-section'>
					<h4
						style={{
							margin: '0 0 6px',
							fontSize: 13.5,
							fontWeight: 800,
							color: 'var(--violet-600)',
						}}
					>
						{section.title}
					</h4>
					<ul
						style={{
							margin: 0,
							paddingLeft: 18,
							fontSize: 13,
							lineHeight: 1.55,
							color: 'var(--ink-700)',
						}}
					>
						{section.items.map((item) => (
							<li key={item} style={{ marginBottom: 3 }}>
								{item}
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
}

export function NotesHelpPanel({ defaultCollapsed = false }) {
	const [collapsed, setCollapsed] = useState(() => readCollapsed(defaultCollapsed));

	const toggle = () => {
		setCollapsed((c) => {
			writeCollapsed(!c);
			return !c;
		});
	};

	return (
		<div
			data-testid='notes-help-panel'
			className='glass glass-frost'
			style={{ borderRadius: 22, padding: '16px 20px', marginBottom: 22 }}
		>
			<button
				type='button'
				data-testid='notes-help-toggle'
				onClick={toggle}
				aria-expanded={!collapsed}
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 10,
					width: '100%',
					padding: 0,
					border: 'none',
					background: 'none',
					cursor: 'pointer',
					fontFamily: 'inherit',
					color: 'var(--ink-900)',
					textAlign: 'left',
				}}
			>
				<span
					style={{
						width: 30,
						height: 30,
						borderRadius: 10,
						display: 'grid',
						placeItems: 'center',
						background: 'rgba(167,139,250,.15)',
						color: 'var(--violet-600)',
						flexShrink: 0,
					}}
				>
					<Icons.info size={17} />
				</span>
				<span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>
					Jak korzystać z notatek?
				</span>
				<span className='muted' style={{ fontSize: 12.5 }}>
					{collapsed ? 'Pokaż' : 'Zwiń'}
				</span>
				<span
					style={{
						display: 'grid',
						transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)',
						transition: 'transform .18s',
					}}
				>
					<Icons.chevR size={16} />
				</span>
			</button>

			{!collapsed && (
				<div data-testid='notes-help-content' style={{ marginTop: 16 }}>
					<HelpSections view='folders' />
				</div>
			)}
		</div>
	);
}

export function NotesHelpButton({ view }) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<button
				type='button'
				data-testid='notes-help-button'
				className='iconbtn'
				onClick={() => setOpen(true)}
				title='Jak to działa?'
				aria-label='Pomoc: jak korzystać z notatek'
			>
				<Icons.info size={18} />
			</button>
			{open && (
				<ConfirmModal
					testId='notes-help-modal'
					title='Jak korzystać z notatek'
					confirmLabel='Rozumiem'
					cancelLabel={null}
					maxWidth={720}
					onConfirm={() => setOpen(false)}
				>
					<div style={{ marginTop: 8 }}>
						<HelpSections view={view} />
					</div>
				</ConfirmModal>
			)}
		</>
	);
}
