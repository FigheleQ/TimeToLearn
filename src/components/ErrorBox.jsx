/* ErrorBox.jsx — czerwony komunikat błędu (styl jak w FlashcardsPage) */
export default function ErrorBox({ children }) {
	return (
		<div
			data-testid='error-box'
			style={{
				marginBottom: 18,
				padding: '12px 16px',
				borderRadius: 13,
				background: 'color-mix(in srgb, #f85149 10%, white)',
				border: '1px solid rgba(248,81,73,.25)',
				fontSize: 13,
				color: '#c0392b',
			}}
		>
			{children}
		</div>
	);
}
