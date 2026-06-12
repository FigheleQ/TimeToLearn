export default function Input({ label, ...props }) {
	return (
		<div>
			{label && (
				<label className='block font-mono text-sm text-text-secondary mb-1'>
					{label}
				</label>
			)}
			<input
				className='w-full p-2 bg-bg-elevated border border-border rounded font-mono text-text-primary focus:outline-none focus:border-accent'
				{...props}
			/>
		</div>
	);
}
