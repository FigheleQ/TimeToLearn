import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { initGlassTilt } from './utils/glassTilt';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HabitsPage from './pages/HabitsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import DeckDetailPage from './pages/DeckDetailPage';

export default function App() {
  useEffect(() => initGlassTilt(), []);

  return (
    <AuthProvider>
      <BrowserRouter>
        {/* gradient world sits behind everything */}
        <div className="world-bg" />

        <Routes>
          {/* public routes — full screen, no shell */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* protected routes — rendered inside the sidebar/rail shell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="habits" element={<HabitsPage />} />
            <Route path="flashcards" element={<FlashcardsPage />} />
            <Route path="flashcards/:deckId" element={<DeckDetailPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
