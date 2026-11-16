/* HtmlContent.jsx — render HTML-u notatek (np. Rozdział) w typografii .md-body
 * Sanitizuje sam, nawet jeśli wywołujący już to zrobił — tanie, a chroni przed pomyłką.
 */
import { useMemo } from 'react';
import { sanitizeHtml } from '../utils/noteHtml';

export default function HtmlContent({ html, ...props }) {
	const safe = useMemo(() => sanitizeHtml(html), [html]);
	return (
		<div
			className='md-body'
			{...props}
			dangerouslySetInnerHTML={{ __html: safe }}
		/>
	);
}
