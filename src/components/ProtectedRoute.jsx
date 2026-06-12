import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Opakowuje trasy, które wymagają zalogowania
export default function ProtectedRoute({ children }) {
	const { user } = useAuth();

	if (user === null) {
		return <Navigate to='/login' replace />;
	} else {
		return children;
	}
}
