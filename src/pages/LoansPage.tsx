import { useEffect, useState } from 'react';
import API from '@/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen } from 'lucide-react';
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

  return (
    <div className="relative rr-scope min-h-screen bg-[#F6F1E7] dark:bg-[#0a0a0a] font-[500] antialiased pb-16">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Public+Sans:wght@400;500;600;700&display=swap');
        .rr-scope { font-family: 'Public Sans', ui-sans-serif, system-ui, sans-serif; color: #241C10; }
        .rr-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
        .rr-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }
        .rr-scope ::-webkit-scrollbar { height: 10px; width: 10px; }
        .rr-scope ::-webkit-scrollbar-track { background: #EFE6D3; }
        .rr-scope ::-webkit-scrollbar-thumb { background: #B08968; border-radius: 999px; border: 2px solid #EFE6D3; }
        .rr-corner { position: relative; background: #FFFDF8; padding: 3px; border: 1px solid #E4D8BE; }
        .rr-stamp { transform: rotate(-4deg); border: 2px solid currentColor; border-radius: 3px; box-shadow: 0 0 0 1px currentColor inset; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.4] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4yIiAvPjwvc3ZnPg==')] bg-repeat"
        />
        {/* Plaque header */}
        <div className="rr-display bg-[#1F4738] rounded-t-md relative overflow-hidden mb-8">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#D9C08F] to-transparent" />
          <div className="flex items-center gap-4 px-6 md:px-9 py-7">
            <div className="w-11 h-11 rounded-full border-2 border-[#B08968] flex items-center justify-center shrink-0 bg-[#173328]">
              <BookOpen className="w-5 h-5 text-[#D9C08F]" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-3xl md:text-[2.2rem] leading-none font-semibold tracking-tight text-[#F6F1E7]">My Loans</h1>
              <p className="rr-mono text-[11px] tracking-[0.2em] uppercase text-[#B9CDC1] mt-2">Circulation Record</p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-[#F6DED8] border-[#A63D2F]/40 text-[#7A2C21] rounded-sm">
            <AlertDescription className="rr-mono text-xs">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 bg-[#E3EEE5] border-[#1F4738]/30 text-[#1F4738] rounded-sm">
            <AlertDescription className="rr-mono text-xs">{success}</AlertDescription>
          </Alert>
        )}

        <Card className="border border-[#D9C9A3] shadow-[0_20px_40px_-24px_rgba(31,71,56,0.35)] bg-[#FFFDF8] rounded-md overflow-hidden">
          <CardHeader className="bg-[#FFFDF8] border-b-2 border-[#1F4738] py-5 px-7">
            <CardTitle className="rr-display text-[#1F4738] text-xl font-semibold tracking-tight">Borrowed Books</CardTitle>
            <CardDescription className="rr-mono text-[11px] text-[#4A3F2A] tracking-wide">Track your borrowed books and due dates</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-64 gap-4">
                <div className="w-10 h-10 rounded-full border-[3px] border-[#E4D8BE] border-t-[#1F4738] animate-spin" />
                <span className="rr-mono text-[11px] uppercase tracking-[0.2em] text-[#8A7A54]">Retrieving records…</span>
              </div>
            ) : loans.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#D9C9A3] flex items-center justify-center mb-5">
                  <BookOpen className="w-7 h-7 text-[#B08968]" strokeWidth={1.5} />
                </div>
                <h3 className="rr-display text-2xl font-semibold text-[#1F4738]">No loans</h3>
                <p className="text-[#6B5B3F] text-sm mt-2">You haven&apos;t borrowed any books yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-[#1F4738] bg-[#1F4738] hover:bg-[#1F4738]">
                      <TableHead className="rr-mono py-4 px-6 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.15em] w-[90px]">Cover</TableHead>
                      <TableHead className="rr-mono py-4 px-6 text-[10px] font-semibold text-[#D9C08F] uppercase tracking-[0.15em] min-w-[180px]">Title</TableHead>
                      <TableHead className="rr-mono py-4 px-6 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.15em] min-w-[140px]">Author</TableHead>
                      <TableHead className="rr-mono py-4 px-6 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.15em] w-[120px]">Borrowed</TableHead>
                      <TableHead className="rr-mono py-4 px-6 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.15em] w-[120px]">Due Date</TableHead>
                      <TableHead className="rr-mono py-4 px-6 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.15em] w-[120px]">Status</TableHead>
                      <TableHead className="rr-mono py-4 px-6 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.15em] text-right w-[120px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((loan, idx) => {
                      const isOverdue = !loan.returned_at && new Date(loan.due_date) < new Date();
                      return (
                        <TableRow
                          key={loan.id}
                          className={`border-b border-[#E4D8BE] transition-colors hover:bg-[#F1E4C4] ${idx % 2 === 1 ? 'bg-[#F6F1E7]' : 'bg-[#FFFDF8]'}`}
                        >
                          <TableCell className="px-6 py-4">
                            <div className="rr-corner w-11 h-[3.6rem] shadow-sm">
                              {loan.cover_image_url ? (
                                <img src={loan.cover_image_url} alt={loan.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#EFE6D3] text-[#8A7A54] text-[9px] font-medium text-center leading-tight px-1">No cover</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-[15px] rr-display font-semibold text-[#1F4738]">{loan.title}</TableCell>
                          <TableCell className="px-6 py-4 text-sm text-[#4A3F2A]">{loan.author}</TableCell>
                          <TableCell className="rr-mono px-6 py-4 text-sm text-[#4A3F2A]">{new Date(loan.borrowed_at).toLocaleDateString()}</TableCell>
                          <TableCell className="rr-mono px-6 py-4 text-sm text-[#4A3F2A]">{new Date(loan.due_date).toLocaleDateString()}</TableCell>
                          <TableCell className="px-6 py-4">
                            {loan.returned_at ? (
                              <span className="rr-stamp rr-mono inline-block text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 text-[#1F4738]">
                                Returned
                              </span>
                            ) : isOverdue ? (
                              <span className="rr-stamp rr-mono inline-block text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 text-[#A63D2F]">
                                Overdue
                              </span>
                            ) : (
                              <span className="rr-stamp rr-mono inline-block text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 text-[#8A5A22]">
                                Active
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            {!loan.returned_at && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReturn(loan.id)}
                                className="rr-mono border-[#1F4738] text-[#1F4738] hover:bg-[#1F4738] hover:text-[#F6F1E7] rounded-sm text-[11px] uppercase tracking-wide h-8"
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}