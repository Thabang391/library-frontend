import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RegisterPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, username);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-800 px-4 py-12">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
        <CardHeader className="space-y-1 text-center relative">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500/30 to-emerald-300/20 backdrop-blur-sm border border-white/20 shadow-inner">
            <svg className="h-8 w-8 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold text-white">Create an account</CardTitle>
          <CardDescription className="text-slate-300">Enter your details to start building your library</CardDescription>
        </CardHeader>

        <CardContent className="relative">
          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-500/20 border-red-400/30 text-red-200 backdrop-blur-sm rounded-xl">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-200 font-medium">Username</Label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <Input
                  id="username"
                  type="text"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:ring-2 focus:ring-emerald-400 focus:border-transparent rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200 font-medium">Email</Label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:ring-2 focus:ring-emerald-400 focus:border-transparent rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200 font-medium">Password</Label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:ring-2 focus:ring-emerald-400 focus:border-transparent rounded-xl transition-all"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Minimum 6 characters.</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white font-semibold rounded-xl shadow-lg shadow-slate-900/30 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center border-t border-white/10 pt-6 relative">
          <p className="text-sm text-slate-300">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-300 hover:text-emerald-200 transition-colors">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}