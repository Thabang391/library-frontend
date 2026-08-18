import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '@/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>('');
  const [order, setOrder] = useState<string>('asc');
  const [authorFilter, setAuthorFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, any> = { page, limit };
      if (sortBy) params.sortBy = sortBy;
      if (order) params.order = order;
      if (authorFilter.trim()) params.author = authorFilter.trim();
      
      const res = await API.get('/books', { params });
      setBooks(res.data.data);
      setTotal(res.data.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, limit, sortBy, order, authorFilter]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await API.delete(`/books/${id}`);
      fetchBooks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 text-white font-sans antialiased pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">Books</h1>
            <p className="text-slate-300 mt-1">Manage your library's book collection</p>
          </div>
          <Link 
  to="/books/new" 
  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl px-6 py-3 transition-all duration-300 font-medium text-sm"
>
  <Plus className="w-5 h-5" />
  <span>Create New Book</span>
</Link>
        </div>

        <Card className="mb-6 border-0 shadow-lg bg-white/5 backdrop-blur-xl rounded-2xl">
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-grow max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <Input
                type="text"
                placeholder="Filter by author..."
                value={authorFilter}
                onChange={(e) => { setPage(1); setAuthorFilter(e.target.value); }}
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:ring-2 focus:ring-indigo-400 focus:border-transparent rounded-xl transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={sortBy || 'all'} onValueChange={(value) => { setPage(1); setSortBy(value === 'all' ? '' : value); }}>
                <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-slate-200 focus:ring-indigo-400 rounded-xl">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 text-white">
                  <SelectItem value="all">Sort by...</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                </SelectContent>
              </Select>

              <Select value={order} onValueChange={(value) => { setPage(1); setOrder(value); }}>
                <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-slate-200 focus:ring-indigo-400 rounded-xl">
                  <SelectValue placeholder="Order..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 text-white">
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={String(limit)} onValueChange={(value) => { setPage(1); setLimit(Number(value)); }}>
                <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-slate-200 focus:ring-indigo-400 rounded-xl">
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 text-white">
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/20 border-red-400/30 text-red-200 backdrop-blur-sm rounded-xl">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-transparent border-b border-white/10 py-5">
            <CardTitle className="text-white text-xl font-bold">Collection</CardTitle>
            <CardDescription className="text-slate-300">Browse and manage your book inventory</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
              </div>
            ) : books.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <svg className="w-16 h-16 text-slate-500 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <h3 className="text-xl font-semibold text-white">No books found</h3>
                <p className="text-slate-300 text-sm mt-1">Try adjusting your filters or add a new book.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/10 hover:bg-white/5">
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Author</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id} className="border-b border-white/5 transition-all hover:bg-white/5 group">
                      <TableCell className="px-6 py-4 text-sm font-mono text-slate-400">#{book.id}</TableCell>
                      <TableCell className="px-6 py-4 text-sm font-semibold text-white">{book.title}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-slate-300">{book.author}</TableCell>
                      <TableCell className="px-6 py-4 text-right space-x-5">
                        <Link to={`/books/${book.id}/edit`} className="font-medium text-indigo-300 hover:text-indigo-100 transition-colors">Edit</Link>
                        <button onClick={() => handleDelete(book.id)} className="font-medium text-red-400 hover:text-red-200 transition-colors">Delete</button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {!loading && books.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-sm text-slate-300">
              Page <span className="font-semibold text-white">{page}</span> of <span className="font-semibold text-white">{totalPages}</span>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                disabled={page <= 1} 
                onClick={() => setPage(page - 1)}
                className="border-white/20 text-slate-200 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                disabled={page >= totalPages} 
                onClick={() => setPage(page + 1)}
                className="border-white/20 text-slate-200 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}