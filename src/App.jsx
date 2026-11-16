import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { initGlassTilt } from './utils/glassTilt';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import HabitsPage from './pages/HabitsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import DeckDetailPage from './pages/DeckDetailPage';
import NotesPage from './pages/NotesPage';
import NoteFolderPage from './pages/NoteFolderPage';
import ChapterPage from './pages/ChapterPage';

// edytor (TipTap + ProseMirror) ładowany dopiero przy wejściu na stronę edycji
const NoteEditorPage = lazy(() => import('./pages/NoteEditorPage'));

export default function App() {
  useEffect(() => initGlassTilt(), []);

  return (
    <AuthProvider>
      <BrowserRouter>
        {/* gradient world sits behind everything */}
        <div className="world-bg" />

        <Routes>
          {/* public routes — full screen, no shell */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
          {/* bez GuestRoute/ProtectedRoute: wejście z linku z maila zakłada sesję „resetu”,
              a brak sesji to osobny komunikat „link wygasł” na tej stronie */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />

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
            <Route path="notes" element={<NotesPage />} />
            <Route path="notes/:folderId" element={<NoteFolderPage />} />
            <Route path="notes/:folderId/chapter" element={<ChapterPage />} />
            <Route
              path="notes/:folderId/:noteId/edit"
              element={
                <Suspense fallback={<div className="muted" style={{ padding: '20px 4px' }}>Ładowanie edytora…</div>}>
                  <NoteEditorPage />
                </Suspense>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
