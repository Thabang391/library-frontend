import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '@/api';
import { useAuth } from '@/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface Book {
  id: number;
  title: string;
  author: string;
  cover_image_url?: string;
  genre?: string;
  publication_year?: number;
  isbn?: string;
  is_borrowed?: boolean;
}

export default function BooksPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>('');
  const [order, setOrder] = useState<string>('asc');

  // Search filters
  const [titleFilter, setTitleFilter] = useState<string>('');
  const [authorFilter, setAuthorFilter] = useState<string>('');
  const [genreFilter, setGenreFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [isbnFilter, setIsbnFilter] = useState<string>('');

  const debouncedTitle = useDebounce(titleFilter, 300);
  const debouncedAuthor = useDebounce(authorFilter, 300);
  const debouncedGenre = useDebounce(genreFilter, 300);
  const debouncedYear = useDebounce(yearFilter, 300);
  const debouncedIsbn = useDebounce(isbnFilter, 300);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTrigger, setSearchTrigger] = useState<number>(0);
  const [borrowingBookId, setBorrowingBookId] = useState<number | null>(null);

  const canModify = user && ['admin', 'librarian'].includes(user.role);

  const activeFilters = [
    titleFilter, authorFilter, genreFilter, yearFilter, isbnFilter
  ].filter(f => f && f.trim() !== '').length;

  // Central fetch function
  const fetchBooks = useCallback(async (
    currentPage: number,
    currentLimit: number,
    currentSortBy: string,
    currentOrder: string,
    filters: { title: string; author: string; genre: string; year: string; isbn: string }
  ) => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit: currentLimit,
      };
      if (currentSortBy) params.sortBy = currentSortBy;
      if (currentOrder) params.order = currentOrder;

      if (filters.title) params.title = filters.title;
      if (filters.author) params.author = filters.author;
      if (filters.genre) params.genre = filters.genre;
      if (filters.year) params.year = filters.year;
      if (filters.isbn) params.isbn = filters.isbn;

      const res = await API.get('/books', { params });
      setBooks(res.data.data);
      setTotal(res.data.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect for debounced filters + sorting/pagination
  useEffect(() => {
    fetchBooks(
      page,
      limit,
      sortBy,
      order,
      {
        title: debouncedTitle,
        author: debouncedAuthor,
        genre: debouncedGenre,
        year: debouncedYear,
        isbn: debouncedIsbn,
      }
    );
  }, [
    page,
    limit,
    sortBy,
    order,
    debouncedTitle,
    debouncedAuthor,
    debouncedGenre,
    debouncedYear,
    debouncedIsbn,
    fetchBooks
  ]);

  // Effect for manual search (triggered by searchTrigger)
  useEffect(() => {
    if (searchTrigger > 0) {
      fetchBooks(
        1,
        limit,
        sortBy,
        order,
        {
          title: titleFilter,
          author: authorFilter,
          genre: genreFilter,
          year: yearFilter,
          isbn: isbnFilter,
        }
      );
      setPage(1);
    }
  }, [searchTrigger, limit, sortBy, order, titleFilter, authorFilter, genreFilter, yearFilter, isbnFilter, fetchBooks]);

  const handleSearch = () => {
    setPage(1);
    setSearchTrigger(prev => prev + 1);
  };

  const handleDelete = async (id: number) => {
    if (!canModify) return;
    if (!window.confirm('Delete this book?')) return;
    try {
      await API.delete(`/books/${id}`);
      fetchBooks(page, limit, sortBy, order, {
        title: debouncedTitle,
        author: debouncedAuthor,
        genre: debouncedGenre,
        year: debouncedYear,
        isbn: debouncedIsbn,
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleBorrow = async (bookId: number) => {
    if (!user) return;
    setBorrowingBookId(bookId);
    try {
      await API.post('/loans', { bookId });
      alert('Book borrowed successfully!');
      // Refresh the list to update availability
      fetchBooks(page, limit, sortBy, order, {
        title: debouncedTitle,
        author: debouncedAuthor,
        genre: debouncedGenre,
        year: debouncedYear,
        isbn: debouncedIsbn,
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to borrow book');
    } finally {
      setBorrowingBookId(null);
    }
  };

  const clearFilters = () => {
    setTitleFilter('');
    setAuthorFilter('');
    setGenreFilter('');
    setYearFilter('');
    setIsbnFilter('');
    setPage(1);
    setSearchTrigger(0);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 text-white font-sans antialiased pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">Books</h1>
            <p className="text-slate-300 mt-1">Manage your library's book collection</p>
          </div>
          {canModify && (
            <Link
              to="/books/new"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl px-6 py-3 transition-all duration-300 font-medium text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Book</span>
            </Link>
          )}
        </div>

        {/* Advanced Search / Filter Card */}
        <Card className="mb-6 border-0 shadow-lg bg-white/5 backdrop-blur-xl rounded-2xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-300" />
                <span className="text-sm font-medium text-slate-300">Filters</span>
                {activeFilters > 0 && (
                  <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full">
                    {activeFilters} active
                  </Badge>
                )}
              </div>
              {activeFilters > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-xs text-slate-400 hover:text-white hover:bg-white/10 rounded-lg px-3 py-1 h-auto"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label htmlFor="title-search" className="text-xs text-slate-400 font-medium">Title</Label>
                <Input
                  id="title-search"
                  type="text"
                  placeholder="Search by title..."
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:ring-2 focus:ring-indigo-400 focus:border-transparent rounded-xl transition-all"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="author-search" className="text-xs text-slate-400 font-medium">Author</Label>
                <Input
                  id="author-search"
                  type="text"
                  placeholder="Search by author..."
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:ring-2 focus:ring-indigo-400 focus:border-transparent rounded-xl transition-all"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="genre-search" className="text-xs text-slate-400 font-medium">Genre</Label>
                <Input
                  id="genre-search"
                  type="text"
                  placeholder="e.g. Fiction"
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:ring-2 focus:ring-indigo-400 focus:border-transparent rounded-xl transition-all"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="year-search" className="text-xs text-slate-400 font-medium">Year</Label>
                <Input
                  id="year-search"
                  type="number"
                  placeholder="e.g. 2020"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:ring-2 focus:ring-indigo-400 focus:border-transparent rounded-xl transition-all"
                />
              </div>
              <div className="space-y-1 md:col-span-2 lg:col-span-1">
                <Label htmlFor="isbn-search" className="text-xs text-slate-400 font-medium">ISBN</Label>
                <Input
                  id="isbn-search"
                  type="text"
                  placeholder="Partial ISBN"
                  value={isbnFilter}
                  onChange={(e) => setIsbnFilter(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:ring-2 focus:ring-indigo-400 focus:border-transparent rounded-xl transition-all"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl px-4 py-2 transition-all duration-300 w-full"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Sorting and Pagination Controls */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/10">
              <span className="text-xs text-slate-400 font-medium">Sort by:</span>
              <Select value={sortBy || 'all'} onValueChange={(value) => { setPage(1); setSortBy(value === 'all' ? '' : value); }}>
                <SelectTrigger className="w-[130px] bg-white/10 border-white/20 text-slate-200 focus:ring-indigo-400 rounded-xl h-9">
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 text-white">
                  <SelectItem value="all">Default</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={order} onValueChange={(value) => { setPage(1); setOrder(value); }}>
                <SelectTrigger className="w-[130px] bg-white/10 border-white/20 text-slate-200 focus:ring-indigo-400 rounded-xl h-9">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 text-white">
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={String(limit)} onValueChange={(value) => { setPage(1); setLimit(Number(value)); }}>
                <SelectTrigger className="w-[130px] bg-white/10 border-white/20 text-slate-200 focus:ring-indigo-400 rounded-xl h-9">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 text-white">
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>

              <span className="text-xs text-slate-400 ml-auto">
                {total} book{total !== 1 ? 's' : ''} found
              </span>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/20 border-red-400/30 text-red-200 backdrop-blur-sm rounded-xl">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Books Table */}
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
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Cover</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Author</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Genre</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Year</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</TableHead>
                    {canModify && (
                      <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</TableHead>
                    )}
                    {user && !canModify && (
                      <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Borrow</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id} className="border-b border-white/5 transition-all hover:bg-white/5 group">
                      <TableCell className="px-6 py-4">
                        {book.cover_image_url ? (
                          <img src={book.cover_image_url} alt={book.title} className="w-12 h-16 object-cover rounded-md border border-white/10" />
                        ) : (
                          <div className="w-12 h-16 bg-white/5 rounded-md border border-white/5 flex items-center justify-center text-slate-500 text-xs">No cover</div>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm font-semibold text-white">{book.title}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-slate-300">{book.author}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-slate-300">{book.genre || '—'}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-slate-300">{book.publication_year || '—'}</TableCell>
                      <TableCell className="px-6 py-4">
                        {book.is_borrowed ? (
                          <Badge variant="secondary" className="bg-red-500/20 text-red-300">Borrowed</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-300">Available</Badge>
                        )}
                      </TableCell>
                      {canModify && (
                        <TableCell className="px-6 py-4 text-right space-x-5">
                          <Link to={`/books/${book.id}/edit`} className="font-medium text-indigo-300 hover:text-indigo-100 transition-colors">Edit</Link>
                          <button onClick={() => handleDelete(book.id)} className="font-medium text-red-400 hover:text-red-200 transition-colors">Delete</button>
                        </TableCell>
                      )}
                      {user && !canModify && (
                        <TableCell className="px-6 py-4 text-right">
                          {!book.is_borrowed ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBorrow(book.id)}
                              disabled={borrowingBookId === book.id}
                              className="border-white/20 text-slate-200 hover:bg-white/10 rounded-xl"
                            >
                              {borrowingBookId === book.id ? 'Borrowing...' : 'Borrow'}
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">Unavailable</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {!loading && books.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-sm text-slate-300">
              Page <span className="font-semibold text-white">{page}</span> of <span className="font-semibold text-white">{totalPages}</span>
              <span className="ml-2 text-slate-400">({total} items)</span>
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