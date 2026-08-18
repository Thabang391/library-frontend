import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '@/api';
import { useAuth } from '@/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

interface Author {
  id: number;
  name: string;
  book_count: number;
}

export default function AuthorsPage() {
  const { user } = useAuth();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const canModify = user && ['admin', 'librarian'].includes(user.role);

  const fetchAuthors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/authors');
      setAuthors(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch authors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleDelete = async (id: number) => {
    if (!canModify) return;
    if (!window.confirm('Delete this author? All their books will also be deleted.')) return;
    try {
      await API.delete(`/authors/${id}`);
      fetchAuthors();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 text-white font-sans antialiased pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">Authors</h1>
            <p className="text-slate-300 mt-1">Manage the creators behind your books</p>
          </div>
          {canModify && (
            <Link
              to="/authors/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl px-6 py-3 transition-all duration-300 font-medium text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Author</span>
            </Link>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/20 border-red-400/30 text-red-200 backdrop-blur-sm rounded-xl">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-transparent border-b border-white/10 py-5">
            <CardTitle className="text-white text-xl font-bold">Authors List</CardTitle>
            <CardDescription className="text-slate-300">Browse and manage your book contributors</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
              </div>
            ) : authors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <svg className="w-16 h-16 text-slate-500 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <h3 className="text-xl font-semibold text-white">No authors found</h3>
                <p className="text-slate-300 text-sm mt-1">Get started by adding a new author.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/10 hover:bg-white/5">
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Book Count</TableHead>
                    {canModify && (
                      <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authors.map((author) => (
                    <TableRow key={author.id} className="border-b border-white/5 transition-all hover:bg-white/5 group">
                      <TableCell className="px-6 py-4 text-sm font-mono text-slate-400">#{author.id}</TableCell>
                      <TableCell className="px-6 py-4 text-sm font-semibold text-white">{author.name}</TableCell>
                      <TableCell className="px-6 py-4 text-sm">
                        <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 rounded-full px-3 py-1 font-medium border border-indigo-400/20">
                          {author.book_count} Books
                        </Badge>
                      </TableCell>
                      {canModify && (
                        <TableCell className="px-6 py-4 text-right space-x-5">
                          <Link to={`/authors/${author.id}/edit`} className="font-medium text-indigo-300 hover:text-indigo-100 transition-colors">Edit</Link>
                          <button onClick={() => handleDelete(author.id)} className="font-medium text-red-400 hover:text-red-200 transition-colors">Delete</button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}