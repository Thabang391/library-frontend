import { Link } from 'react-router-dom';
import { useAuth } from '@/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-white font-sans antialiased flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-6 py-8 text-center">
        {user ? (
          <>
            <div className="inline-flex items-center px-5 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm font-medium text-indigo-300 mb-4">
              <span className="mr-2">✨</span> Welcome back, {user.email?.split('@')[0]}!
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent mb-4">
              Your Library Dashboard
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mb-12">
              Manage your collection of books and discover the brilliant minds behind them.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
              <Link 
                to="/books" 
                className="group relative p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-400/50 transition-all duration-300 text-left overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 mb-5 flex items-center justify-center bg-indigo-500/20 rounded-2xl text-indigo-300 backdrop-blur-sm">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Books</h3>
                  <p className="text-slate-300 mb-4">Browse, search, and manage your entire book collection.</p>
                  <span className="inline-flex items-center text-sm font-semibold text-indigo-300 group-hover:translate-x-1 transition-transform">
                    Explore Books
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </span>
                </div>
              </Link>

              <Link 
                to="/authors" 
                className="group relative p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-400/50 transition-all duration-300 text-left overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 mb-5 flex items-center justify-center bg-emerald-500/20 rounded-2xl text-emerald-300 backdrop-blur-sm">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Authors</h3>
                  <p className="text-slate-300 mb-4">Discover the creators behind your favorite stories.</p>
                  <span className="inline-flex items-center text-sm font-semibold text-emerald-300 group-hover:translate-x-1 transition-transform">
                    Discover Authors
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </span>
                </div>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="inline-flex items-center px-5 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm font-medium text-indigo-300 mb-8">
              <span className="mr-2">📚</span> Welcome to our digital library
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Your next favorite<br />
              <span className="bg-gradient-to-r from-indigo-400 to-amber-300 bg-clip-text text-transparent">book awaits.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10">
              Join our community today to explore a vast collection, track your reading, and connect with authors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/register" 
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300"
              >
                Get Started
              </Link>
              <Link 
                to="/login" 
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-all duration-300"
              >
                Login to your account
              </Link>
            </div>
          </>
        )}
      </main>

      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-white/10 mt-12">
        <p className="text-center text-sm text-slate-400">© {new Date().getFullYear()} Library App. All rights reserved.</p>
      </footer>
    </div>
  );
}