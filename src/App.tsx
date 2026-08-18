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
                  <ProtectedRoute>
                    <BookFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/books/:id/edit"
                element={
                  <ProtectedRoute>
                    <BookFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/authors/new"
                element={
                  <ProtectedRoute>
                    <AuthorFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/authors/:id/edit"
                element={
                  <ProtectedRoute>
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
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;