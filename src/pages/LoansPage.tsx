import { useEffect, useState } from 'react';
import API from '@/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/AuthContext';

interface Loan {
  id: number;
  book_id: number;
  title: string;
  author: string;
  cover_image_url?: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
}

export default function LoansPage() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await API.get('/loans');
      setLoans(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleReturn = async (loanId: number) => {
    if (!confirm('Return this book?')) return;
    try {
      await API.patch(`/loans/${loanId}/return`);
      setSuccess('Book returned successfully');
      fetchLoans();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Return failed');
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && !loans.find(l => l.id === loanId)?.returned_at; // we'll compute inside map
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 text-white font-sans antialiased pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent mb-8">My Loans</h1>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/20 border-red-400/30 text-red-200 backdrop-blur-sm rounded-xl">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 bg-green-500/20 border-green-400/30 text-green-200 backdrop-blur-sm rounded-xl">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-transparent border-b border-white/10 py-5">
            <CardTitle className="text-white text-xl font-bold">Borrowed Books</CardTitle>
            <CardDescription className="text-slate-300">Track your borrowed books and due dates</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
              </div>
            ) : loans.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <svg className="w-16 h-16 text-slate-500 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <h3 className="text-xl font-semibold text-white">No loans</h3>
                <p className="text-slate-300 text-sm mt-1">You haven't borrowed any books yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/10 hover:bg-white/5">
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Cover</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Author</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Borrowed</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Due Date</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => {
                    const isOverdue = !loan.returned_at && new Date(loan.due_date) < new Date();
                    return (
                      <TableRow key={loan.id} className="border-b border-white/5 transition-all hover:bg-white/5">
                        <TableCell className="px-6 py-4">
                          {loan.cover_image_url ? (
                            <img src={loan.cover_image_url} alt={loan.title} className="w-12 h-16 object-cover rounded-md border border-white/10" />
                          ) : (
                            <div className="w-12 h-16 bg-white/5 rounded-md border border-white/5 flex items-center justify-center text-slate-500 text-xs">No cover</div>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm font-semibold text-white">{loan.title}</TableCell>
                        <TableCell className="px-6 py-4 text-sm text-slate-300">{loan.author}</TableCell>
                        <TableCell className="px-6 py-4 text-sm text-slate-300">{new Date(loan.borrowed_at).toLocaleDateString()}</TableCell>
                        <TableCell className="px-6 py-4 text-sm text-slate-300">{new Date(loan.due_date).toLocaleDateString()}</TableCell>
                        <TableCell className="px-6 py-4 text-sm">
                          {loan.returned_at ? (
                            <Badge variant="secondary" className="bg-green-500/20 text-green-300">Returned</Badge>
                          ) : isOverdue ? (
                            <Badge variant="destructive" className="bg-red-500/20 text-red-300">Overdue</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          {!loan.returned_at && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReturn(loan.id)}
                              className="border-white/20 text-slate-200 hover:bg-white/10 rounded-xl"
                            >
                              Return
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}