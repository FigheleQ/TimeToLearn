import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Odwrotność ProtectedRoute — zalogowany użytkownik trafia na /
export default function GuestRoute({ children }) {
	const { user } = useAuth();
	return user ? <Navigate to="/" replace /> : children;
}
