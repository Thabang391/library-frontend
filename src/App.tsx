// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/AuthContext'; // Added useAuth
import ProtectedRoute from '@/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { ThemeProvider } from '@/components/theme-provider';

import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import HomePage from '@/pages/HomePage';
import BooksPage from '@/pages/BooksPage';
import AuthorsPage from '@/pages/AuthorsPage';
import BookFormPage from '@/pages/BookFormPage';
import AuthorFormPage from '@/pages/AuthorFormPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import LoansPage from './pages/LoansPage';
import BookDetailPage from './pages/BookDetailPage';
import ListsPage from './pages/ListsPage';
import ListDetailPage from './pages/ListDetailPage';
import AdminDashboard from './pages/AdminDashboard';

// Separate component to access useLocation and useAuth safely inside BrowserRouter
function AppContent() {
  const location = useLocation();
  const { user } = useAuth(); // Access the current user state

  // Define routes where the Navbar should be hidden
  // Added condition: Hide Navbar on Homepage (/) when the user is NOT logged in
  const hideNavbarPaths = ['/login', '/register'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname) || (location.pathname === '/' && !user);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Conditionally render Navbar */}
      {!shouldHideNavbar && <Navbar />}
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/authors"
            element={
              <ProtectedRoute>
                <AuthorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <BooksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/new"
            element={
              <ProtectedRoute allowedRoles={['admin', 'librarian']}>
                <BookFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['admin', 'librarian']}>
                <BookFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/:id"
            element={
              <ProtectedRoute>
                <BookDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authors/new"
            element={
              <ProtectedRoute allowedRoles={['admin', 'librarian']}>
                <AuthorFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authors/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['admin', 'librarian']}>
                <AuthorFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loans"
            element={
              <ProtectedRoute>
                <LoansPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lists"
            element={
              <ProtectedRoute>
                <ListsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lists/:id"
            element={
              <ProtectedRoute>
                <ListDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;