import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { BookOpen, Menu, X } from 'lucide-react';

const RR_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Public+Sans:wght@400;500;600;700&display=swap');
  .rr-nav-scope { font-family: 'Public Sans', ui-sans-serif, system-ui, sans-serif; }
  .rr-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
  .rr-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }
`;

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
    `rr-mono px-3.5 py-1.5 rounded-sm text-[11px] font-semibold uppercase tracking-wide transition-colors duration-150 ${
      isActive
        ? 'bg-[#D9C08F] text-[#1F4738]'
        : 'text-[#B9CDC1] hover:text-[#F6F1E7] hover:bg-white/5'
    }`;

  const getMobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rr-mono block px-4 py-2.5 rounded-sm text-sm font-semibold uppercase tracking-wide transition-colors duration-150 ${
      isActive
        ? 'bg-[#D9C08F] text-[#1F4738]'
        : 'text-[#B9CDC1] hover:bg-white/5 hover:text-[#F6F1E7]'
    }`;

  const navLinks = user
    ? [
        { to: '/books', label: 'Books' },
        { to: '/authors', label: 'Authors' },
        { to: '/loans', label: 'My Loans' },
        { to: '/lists', label: 'My Lists' },
        { to: '/profile', label: 'Profile' },
        ...(user.role === 'admin'
          ? [
              { to: '/admin/dashboard', label: 'Dashboard' },
              { to: '/users', label: 'Users' },
            ]
          : []),
      ]
    : [];

  return (
    <nav className="rr-nav-scope sticky top-0 z-50 bg-[#1F4738] relative overflow-hidden">
      <style>{RR_STYLE}</style>
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-[#D9C08F] to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 rounded-full border-2 border-[#B08968] flex items-center justify-center bg-[#173328]">
              <BookOpen className="w-4 h-4 text-[#D9C08F]" strokeWidth={1.75} />
            </div>
            <span className="rr-display text-lg font-semibold tracking-tight text-[#F6F1E7] hidden sm:block">The Reading Room</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {user && navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={getDesktopLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-1.5 pr-3 py-1 bg-white/5 rounded-full border border-[#B08968]/30">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} className="w-6 h-6 rounded-full object-cover border border-[#D9C08F]/40" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#D9C08F] flex items-center justify-center text-[#1F4738] text-[9px] font-bold rr-mono">
                      {user.username?.substring(0, 2).toUpperCase() || user.email?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-[#F6F1E7] truncate max-w-[100px]">{user.username || user.email}</span>
                  <span className="rr-mono text-[9px] uppercase tracking-wide text-[#B9CDC1] bg-white/5 px-1.5 py-0.5 rounded-sm">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rr-mono px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#F6F1E7] bg-white/5 rounded-sm border border-[#B08968]/30 hover:bg-white/10 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="rr-mono px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#B9CDC1] hover:text-[#F6F1E7] transition-colors duration-300">
                  Login
                </Link>
                <Link to="/register" className="rr-mono px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#1F4738] bg-[#D9C08F] rounded-sm hover:bg-[#E5CE9F] transition-colors duration-300">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-sm text-[#B9CDC1] hover:text-[#F6F1E7] hover:bg-white/5 transition-colors duration-200 focus:outline-none"
              aria-expanded={mobileOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#B08968]/20 bg-[#173328]">
          <div className="px-2 pt-2 pb-3 space-y-0.5 sm:px-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2.5 mb-2 border-b border-[#B08968]/20">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} className="w-9 h-9 rounded-full object-cover border border-[#D9C08F]/40" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#D9C08F] flex items-center justify-center text-[#1F4738] text-sm font-bold rr-mono">
                      {user.username?.substring(0, 2).toUpperCase() || user.email?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="rr-mono text-[10px] uppercase tracking-wide text-[#8FA89B]">Signed in as</span>
                    <span className="text-sm font-semibold text-[#F6F1E7] truncate">{user.username || user.email}</span>
                    <span className="rr-mono text-[9px] uppercase tracking-wide text-[#B9CDC1]">{user.role}</span>
                  </div>
                </div>
                {navLinks.map((link) => (
                  <NavLink key={link.to} to={link.to} className={getMobileLinkClass} onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </NavLink>
                ))}
                <button
                  onClick={handleLogout}
                  className="rr-mono block w-full text-left px-4 py-2.5 rounded-sm text-sm font-semibold uppercase tracking-wide text-[#E8A99A] hover:bg-[#A63D2F]/20 hover:text-[#F6DED8] transition-colors duration-200 mt-1"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="rr-mono block w-full text-center px-4 py-2.5 rounded-sm text-sm font-semibold uppercase tracking-wide text-[#B9CDC1] bg-white/5 hover:bg-white/10 transition-colors duration-200">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="rr-mono block w-full text-center px-4 py-2.5 rounded-sm text-sm font-semibold uppercase tracking-wide text-[#1F4738] bg-[#D9C08F] hover:bg-[#E5CE9F] transition-colors duration-200">
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