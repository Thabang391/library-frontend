// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/AuthContext';
import ProtectedRoute from '@/ProtectedRoute';
import Navbar from '@/components/Navbar';

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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
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
                path="/admin"
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;