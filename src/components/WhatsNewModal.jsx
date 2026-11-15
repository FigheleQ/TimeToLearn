/* WhatsNewModal.jsx — okno z nowościami, pokazywane raz po zalogowaniu
 * Montowane w AppLayout (czyli tylko dla zalogowanych).
 * Co użytkownik już widział, pamięta kolumna profiles.last_seen_release.
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import { RELEASES } from '../config/whatsNew';
import { getMyProfile, setLastSeenRelease } from '../services/supabase';

/**
 * Które wpisy changelogu użytkownik jeszcze nie widział.
 * releases — tablica RELEASES (najnowszy pierwszy)
 * lastSeenId — profiles.last_seen_release (string albo null)
 * Zwraca tablicę wpisów do pokazania (najnowszy pierwszy).
 *
 * Przykłady dla releases = [C, B, A] (C najnowszy):
 *   lastSeenId = 'A'   → [C, B]
 *   lastSeenId = 'C'   → []
 *   lastSeenId = null  → [C]   (nowe konto: tylko najświeższa nowość, nie cała historia)
 *   lastSeenId = 'XYZ' → [C]   (wpisu już nie ma w changelogu — traktuj jak null)
 *   releases = []      → []
 */
function getUnseenReleases(releases, lastSeenId) {
	// TODO: zaimplementuj według przykładów powyżej
	return [];
}

export default function WhatsNewModal() {
	const { user } = useAuth();
	const [unseen, setUnseen] = useState([]);

	useEffect(() => {
		if (!user) return;
		let cancelled = false;
		const check = async () => {
			const { data, error } = await getMyProfile();
			if (cancelled || error) return; // brak profilu / błąd sieci → po prostu nie pokazujemy
			setUnseen(getUnseenReleases(RELEASES, data?.last_seen_release ?? null));
		};
		check();
		return () => {
			cancelled = true;
		};
	}, [user]);

	if (unseen.length === 0) return null;

	const handleClose = async () => {
		setUnseen([]);
		await setLastSeenRelease(RELEASES[0].id);
	};

	return (
		<ConfirmModal
			testId='whats-new-modal'
			title='Co nowego w TimeToLearn'
			confirmLabel='Rozumiem'
			cancelLabel={null}
			maxWidth={460}
			onConfirm={handleClose}
		>
			{unseen.map((release) => (
				<section
					key={release.id}
					data-testid='whats-new-release'
					style={{ marginTop: 14 }}
				>
					<div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
						<strong style={{ fontSize: 15 }}>{release.title}</strong>
						<span className='muted' style={{ fontSize: 12 }}>
							{release.date}
						</span>
					</div>
					<ul
						style={{
							margin: '6px 0 0',
							paddingLeft: 18,
							fontSize: 13.5,
							lineHeight: 1.55,
							color: 'var(--ink-700)',
						}}
					>
						{release.items.map((item) => (
							<li key={item}>{item}</li>
						))}
					</ul>
				</section>
			))}
		</ConfirmModal>
	);
}
