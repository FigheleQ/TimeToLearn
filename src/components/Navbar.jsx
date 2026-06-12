import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
	const { user, signOut } = useAuth();
	const navigate = useNavigate();
	const [menuOpen, setMenuOpen] = useState(false);

	const handleSignOut = async () => {
		await signOut();
		navigate('/login');
	};

	const links = [
		{ to: '/flashcards', label: 'fiszki' },
		{ to: '/tutorials', label: 'tutoriale' },
		{ to: '/pomodoro', label: 'pomodoro' },
	];

	return (
		<nav className='border-b border-border bg-bg-surface'>
			<div className='max-w-5xl mx-auto px-4 py-3 flex items-center justify-between'>
				{/* Logo */}
				<Link
					to='/'
					className='font-mono font-bold text-accent hover:opacity-80 transition-opacity'
				>
					<span className='text-text-muted'>~/</span>timetolearn
				</Link>

				{/* Desktop — linki widoczne od md w górę */}
				{user && (
					<div className='hidden md:flex items-center gap-6'>
						{links.map(({ to, label }) => (
							<Link
								key={to}
								to={to}
								className='font-mono text-sm text-text-secondary hover:text-accent transition-colors'
							>
								{label}
							</Link>
						))}
						<button
							onClick={handleSignOut}
							className='font-mono text-sm text-text-muted hover:text-danger transition-colors'
						>
							wyloguj
						</button>
					</div>
				)}

				{/* Mobile — hamburger widoczny tylko do md */}
				{user && (
					<button
						onClick={() => setMenuOpen(!menuOpen)}
						className='md:hidden font-mono text-text-secondary hover:text-accent transition-colors text-xl'
						aria-label='Menu'
					>
						{menuOpen ? '✕' : '☰'}
					</button>
				)}
			</div>

			{/* Mobile — rozwijane menu */}
			{user && menuOpen && (
				<div className='md:hidden border-t border-border bg-bg-surface px-4 py-3 flex flex-col gap-3'>
					{links.map(({ to, label }) => (
						<Link
							key={to}
							to={to}
							onClick={() => setMenuOpen(false)}
							className='font-mono text-sm text-text-secondary hover:text-accent transition-colors'
						>
							{label}
						</Link>
					))}
					<button
						onClick={() => {
							handleSignOut();
							setMenuOpen(false);
						}}
						className='font-mono text-sm text-text-muted hover:text-danger transition-colors text-left'
					>
						wyloguj
					</button>
				</div>
			)}
		</nav>
	);
}
