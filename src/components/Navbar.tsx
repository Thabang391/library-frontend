import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const getDesktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
      isActive
        ? 'bg-white/20 text-white shadow-inner backdrop-blur-sm'
        : 'text-slate-300 hover:text-white hover:bg-white/10'
    }`;

  const getMobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-white/20 text-white backdrop-blur-sm'
        : 'text-slate-300 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-xl font-extrabold tracking-tight text-white hidden sm:block">Library</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            {user && (
              <>
                <NavLink to="/books" className={getDesktopLinkClass}>Books</NavLink>
                <NavLink to="/authors" className={getDesktopLinkClass}>Authors</NavLink>
                {user.role === 'admin' && (
                  <NavLink to="/admin" className={getDesktopLinkClass}>Admin</NavLink>
                )}
                <NavLink to="/loans" className={getDesktopLinkClass}>My Loans</NavLink>
                <NavLink to="/profile" className={getDesktopLinkClass}>Profile</NavLink>
                <NavLink to="/lists" className={getDesktopLinkClass}>My Lists</NavLink>
              </>
            )}
          </div>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.username?.substring(0, 2).toUpperCase() || user.email?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-200">{user.username || user.email}</span>
                  <span className="text-xs text-slate-400 bg-white/10 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-5 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors duration-300">
                  Login
                </Link>
                <Link to="/register" className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors duration-200 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-white/10 backdrop-blur-xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 mb-2 border-b border-white/10">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                      {user.username?.substring(0, 2).toUpperCase() || user.email?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Signed in as</span>
                    <span className="text-sm font-semibold text-white truncate">{user.username || user.email}</span>
                    <span className="text-xs text-slate-400">{user.role}</span>
                  </div>
                </div>
                <NavLink to="/books" className={getMobileLinkClass} onClick={() => setMobileOpen(false)}>Books</NavLink>
                <NavLink to="/authors" className={getMobileLinkClass} onClick={() => setMobileOpen(false)}>Authors</NavLink>
                {user.role === 'admin' && (
                  <NavLink to="/admin" className={getMobileLinkClass} onClick={() => setMobileOpen(false)}>Admin</NavLink>
                )}
                <NavLink to="/loans" className={getMobileLinkClass} onClick={() => setMobileOpen(false)}>My Loans</NavLink>
                <NavLink to="/profile" className={getMobileLinkClass} onClick={() => setMobileOpen(false)}>Profile</NavLink>
                <NavLink to="/lists" className={getMobileLinkClass} onClick={() => setMobileOpen(false)}>My Lists</NavLink>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-colors duration-200 mt-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block w-full text-center px-4 py-3 rounded-lg text-base font-semibold text-slate-300 bg-white/10 hover:bg-white/20 transition-colors duration-200">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block w-full text-center px-4 py-3 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg transition-all duration-200">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}