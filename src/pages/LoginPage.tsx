import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, CheckCircle2, BookOpen } from 'lucide-react';

const RR_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Public+Sans:wght@400;500;600;700&display=swap');
  .rr-scope { font-family: 'Public Sans', ui-sans-serif, system-ui, sans-serif; color: #241C10; }
  .rr-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
  .rr-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }
  .rr-ruled-input {
    background: transparent; border: none; border-bottom: 1.5px solid #C9BB9C;
    border-radius: 0; padding-left: 2px; color: #241C10;
  }
  .rr-ruled-input::placeholder { color: #A99A7A; }
  .rr-ruled-input:focus { outline: none; box-shadow: none; border-bottom-color: #B08968; border-bottom-width: 2px; }
`;

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setLoading(false);
      setToastVisible(true);
      // Show toast briefly before navigating to dashboard
      setTimeout(() => {
        setToastVisible(false);
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="relative rr-scope min-h-screen w-full flex flex-col items-center justify-center bg-[#F6F1E7] dark:bg-[#0a0a0a] font-[500] px-4">
      <div
          className="absolute inset-0 pointer-events-none opacity-[0.4] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4yIiAvPjwvc3ZnPg==')] bg-repeat"
        />
      <style>{RR_STYLE}</style>

      {/* Toast Notification */}
      {toastVisible && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 bg-[#1F4738] dark:bg-[#0a0a0a] rounded-sm border border-[#D9C9A3] shadow-2xl shadow-white/20 animate-in slide-in-from-top-4 fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 text-[#D9C08F]" />
          <span className="rr-mono text-xs uppercase tracking-wide text-[#F6F1E7]">Welcome back — signed in successfully</span>
        </div>
      )}

      {/* Sign In Card */}
      <div className="w-full max-w-[440px] bg-[#FFFDF8] border border-[#D9C9A3] rounded-md shadow-[0_24px_48px_-28px_rgba(31,71,56,0.4)] overflow-hidden relative z-10">
        <div className="bg-[#1F4738] relative overflow-hidden px-8 py-8 flex flex-col items-center gap-3">
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-[#D9C08F] to-transparent" />
          <div className="h-11 w-11 rounded-full border-2 border-[#B08968] bg-[#173328] flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-[#D9C08F]" strokeWidth={1.75} />
          </div>
          <div className="text-center">
            <h1 className="rr-display text-2xl font-semibold tracking-tight text-[#F6F1E7]">Sign In</h1>
            <p className="rr-mono text-[11px] uppercase tracking-[0.15em] text-[#B9CDC1] mt-1">Continue to your reading room</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5 p-8">
          {error && (
            <div className="bg-[#F6DED8] border border-[#A63D2F]/40 text-[#7A2C21] text-xs rr-mono p-3 rounded-sm">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="rr-mono text-[10px] text-[#8A7A54] dark:text-[#4A3F2A] font-semibold tracking-[0.15em] uppercase">Email or Username</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rr-ruled-input h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="rr-mono text-[10px] text-[#8A7A54] dark:text-[#4A3F2A] font-semibold tracking-[0.15em] uppercase">Password</Label>
              <a href="#" className="rr-mono text-[10px] uppercase tracking-wide text-[#8A5A3F] dark:text-[#4A3F2A] hover:text-[#1F4738] transition-colors">Forgot Password?</a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rr-ruled-input h-9 text-sm pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-[#A99A7A] hover:text-[#1F4738] transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-[#4A3F2A]" /> : <Eye className="h-4 w-4 text-[#4A3F2A]" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="rr-mono w-full h-10 bg-[#1F4738] hover:bg-[#24543F] text-[#F6F1E7] font-semibold rounded-sm text-xs uppercase tracking-wider transition-colors mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-[#F6F1E7]/40 border-t-[#F6F1E7] animate-spin" />
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </div>

      {/* Sign Up Link */}
      <p className="rr-mono mt-5 mb-10 text-xs uppercase tracking-wide text-[#A99A7A] text-center relative z-10">
        Need a membership?{' '}
        <Link to="/register" className="text-[#1F4738] dark:text-[#8BA695] font-semibold hover:underline">
          Sign up
        </Link>
      </p>

      {/* Footer Links */}
      <div className="absolute bottom-6 flex items-center justify-center gap-6 rr-mono text-[10px] uppercase tracking-wide text-[#A99A7A]">
        <a href="#" className="hover:text-[#6B5B3F] transition-colors">Privacy</a>
        <a href="#" className="hover:text-[#6B5B3F] transition-colors">Terms</a>
        <a href="#" className="hover:text-[#6B5B3F] transition-colors">Status</a>
      </div>
    </div>
  );
}