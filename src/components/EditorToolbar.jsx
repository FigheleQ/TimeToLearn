/* EditorToolbar.jsx — pasek narzędzi edytora (wygląd gotowy, logika w config/editorToolbar.js) */
import { useEditorState } from '@tiptap/react';
import { isEditorReady } from '../hooks/useNoteEditor';
import {
	TOOLBAR_BUTTONS,
	TEXT_COLORS,
	HIGHLIGHT_COLORS,
	COLOR_ACTIONS,
	HIGHLIGHT_ACTIONS,
} from '../config/editorToolbar';

const btnStyle = (active) => ({
	minWidth: 34,
	height: 34,
	padding: '0 9px',
	borderRadius: 10,
	border: '1px solid ' + (active ? 'transparent' : 'rgba(167,139,250,.25)'),
	background: active
		? 'linear-gradient(180deg, var(--violet-500), var(--violet-600))'
		: 'rgba(255,255,255,.7)',
	color: active ? '#fff' : 'var(--ink-700)',
	fontFamily: 'inherit',
	fontSize: 13,
	fontWeight: 700,
	cursor: 'pointer',
});

const swatchStyle = (color, active) => ({
	width: 24,
	height: 24,
	borderRadius: 8,
	border: active ? '2px solid var(--ink-900)' : '1px solid rgba(0,0,0,.12)',
	background: color,
	cursor: 'pointer',
	padding: 0,
});

const Divider = () => (
	<span
		aria-hidden
		style={{ width: 1, alignSelf: 'stretch', background: 'rgba(167,139,250,.3)', margin: '0 4px' }}
	/>
);

// mousedown z preventDefault: kliknięcie w pasek nie zabiera fokusu (ani zaznaczenia) z edytora
const keepFocus = (e) => e.preventDefault();

export default function EditorToolbar({ editor }) {
	// przerysuj pasek, gdy zmienia się zaznaczenie / formatowanie pod kursorem
	const active = useEditorState({
		editor,
		selector: ({ editor: e }) =>
			isEditorReady(e)
				? {
						buttons: TOOLBAR_BUTTONS.map((b) => !!b.isActive(e)),
						colors: TEXT_COLORS.map((c) => !!COLOR_ACTIONS.isActive(e, c.value)),
						highlights: HIGHLIGHT_COLORS.map((c) => !!HIGHLIGHT_ACTIONS.isActive(e, c.value)),
					}
				: null,
	});

	if (!editor || !active) return null;

	return (
		<div
			data-testid='editor-toolbar'
			role='toolbar'
			aria-label='Formatowanie'
			style={{
				display: 'flex',
				flexWrap: 'wrap',
				alignItems: 'center',
				gap: 6,
				padding: 10,
				borderRadius: 16,
				background: 'rgba(255,255,255,.55)',
				border: '1px solid rgba(255,255,255,.7)',
				marginBottom: 12,
			}}
		>
			{TOOLBAR_BUTTONS.map((b, i) => {
				const showDivider = i > 0 && TOOLBAR_BUTTONS[i - 1].group !== b.group;
				return (
					<span key={b.id} style={{ display: 'contents' }}>
						{showDivider && <Divider />}
						<button
							type='button'
							data-testid={`toolbar-${b.id}`}
							title={b.title}
							aria-pressed={active.buttons[i]}
							onMouseDown={keepFocus}
							onClick={() => b.run(editor)}
							style={{
								...btnStyle(active.buttons[i]),
								fontStyle: b.id === 'italic' ? 'italic' : 'normal',
								textDecoration: b.id === 'strike' ? 'line-through' : 'none',
							}}
						>
							{b.label}
						</button>
					</span>
				);
			})}

			<Divider />
			<span className='muted' style={{ fontSize: 12, fontWeight: 600 }}>
				Kolor
			</span>
			{TEXT_COLORS.map((c, i) => (
				<button
					key={c.value}
					type='button'
					data-testid={`toolbar-color-${i}`}
					title={`Kolor: ${c.name}`}
					aria-pressed={active.colors[i]}
					onMouseDown={keepFocus}
					onClick={() => COLOR_ACTIONS.run(editor, c.value)}
					style={swatchStyle(c.value, active.colors[i])}
				/>
			))}
			<button
				type='button'
				data-testid='toolbar-color-clear'
				title='Bez koloru'
				onMouseDown={keepFocus}
				onClick={() => COLOR_ACTIONS.clear(editor)}
				style={{ ...btnStyle(false), minWidth: 24, height: 24, padding: '0 6px', fontSize: 11 }}
			>
				✕
			</button>

			<Divider />
			<span className='muted' style={{ fontSize: 12, fontWeight: 600 }}>
				Zakreślacz
			</span>
			{HIGHLIGHT_COLORS.map((c, i) => (
				<button
					key={c.value}
					type='button'
					data-testid={`toolbar-highlight-${i}`}
					title={`Zakreślacz: ${c.name}`}
					aria-pressed={active.highlights[i]}
					onMouseDown={keepFocus}
					onClick={() => HIGHLIGHT_ACTIONS.run(editor, c.value)}
					style={swatchStyle(c.value, active.highlights[i])}
				/>
			))}
			<button
				type='button'
				data-testid='toolbar-highlight-clear'
				title='Usuń zakreślenie'
				onMouseDown={keepFocus}
				onClick={() => HIGHLIGHT_ACTIONS.clear(editor)}
				style={{ ...btnStyle(false), minWidth: 24, height: 24, padding: '0 6px', fontSize: 11 }}
			>
				✕
			</button>
		</div>
	);
}
