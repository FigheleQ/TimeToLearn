/* Markdown.jsx — bezpieczny render Markdown
 * marked zamienia tekst na HTML, DOMPurify wycina z niego skrypty,
 * on*-handlery i javascript: URL-e. Importowany plik .md może zawierać
 * surowy HTML, więc bez sanitizacji dangerouslySetInnerHTML = XSS.
 */
import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ gfm: true, breaks: false });

export default function Markdown({ source, ...props }) {
	const html = useMemo(
		() => DOMPurify.sanitize(marked.parse(source ?? '')),
		[source],
	);

	return (
		<div
			className='md-body'
			{...props}
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
