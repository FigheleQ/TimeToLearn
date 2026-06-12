import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setUser(session?.user ?? null);
			setLoading(false);
		};
		fetchSession();
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		return () => subscription.unsubscribe();
	}, []);
  
	const signIn = async (email, password) => {
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		return { error };
	};

	const signUp = async (email, password) => {
		const { error } = await supabase.auth.signUp({ email, password });
		return { error };
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		return { error };
	};

	const value = { user, loading, signIn, signUp, signOut };

	return (
		<AuthContext.Provider value={value}>
			{/* Czekamy na sprawdzenie sesji zanim wyrenderujemy dzieci —
          zapobiega "miganiu" między stanem niezalogowanym a zalogowanym */}
			{!loading && children}
		</AuthContext.Provider>
	);
}

// Eksportujemy hook razem z kontekstem — importujesz z jednego miejsca
export function useAuth() {
	const context = useContext(AuthContext);
	if (!context)
		throw new Error('useAuth musi być używany wewnątrz AuthProvider');
	return context;
}
