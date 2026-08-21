import { useEffect, useState, useCallback, useMemo } from 'react';
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
import { Plus, Search, X, Filter, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface Author {
  id: number;
  name: string;
  book_count: number;
}

export default function AuthorsPage() {
  const { user } = useAuth();
  const [allAuthors, setAllAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Search / filter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Sorting
  const [sortBy, setSortBy] = useState<string>('name');
  const [order, setOrder] = useState<string>('asc');

  const canModify = user && ['admin', 'librarian'].includes(user.role);

  // Fetch all authors (we'll filter & paginate client-side)
  const fetchAuthors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/authors');
      setAllAuthors(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch authors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  // Filter and sort authors
  const filteredAndSorted = useMemo(() => {
    let result = [...allAuthors];

    // Filter by name
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      result = result.filter(author => author.name.toLowerCase().includes(q));
    }

    // Sort
    if (sortBy === 'name') {
      result.sort((a, b) => (order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
    } else if (sortBy === 'book_count') {
      result.sort((a, b) => (order === 'asc' ? a.book_count - b.book_count : b.book_count - a.book_count));
    }

    return result;
  }, [allAuthors, debouncedSearch, sortBy, order]);

  // Paginate
  const total = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paginatedAuthors = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredAndSorted.slice(start, end);
  }, [filteredAndSorted, page, limit]);

  // Reset page when filters or limit change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, order, limit]);

  const handleDelete = async (id: number) => {
    if (!canModify) return;
    if (!window.confirm('Delete this author? All their books will also be deleted.')) return;
    try {
      await API.delete(`/authors/${id}`);
      fetchAuthors(); // refresh list
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPage(1);
  };

  const activeFilters = searchTerm.trim() ? 1 : 0;

  // Helper: render stars not needed for authors

  return (
    <div className="relative rr-scope min-h-screen bg-[#F6F1E7] dark:bg-[#0a0a0a] font-[500] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Public+Sans:wght@400;500;600;700&display=swap');

        .rr-scope { font-family: 'Public Sans', ui-sans-serif, system-ui, sans-serif; color: #241C10; }
        .rr-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
        .rr-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }

        .rr-scope ::-webkit-scrollbar { height: 10px; width: 10px; }
        .rr-scope ::-webkit-scrollbar-track { background: #EFE6D3; }
        .rr-scope ::-webkit-scrollbar-thumb { background: #B08968; border-radius: 999px; border: 2px solid #EFE6D3; }

        .rr-paper {
          background-color: #F6F1E7;
          background-image: radial-gradient(#00000008 0.6px, transparent 0.6px);
          background-size: 14px 14px;
        }

        .rr-stamp {
          transform: rotate(-4deg);
          border: 2px solid currentColor;
          border-radius: 3px;
          box-shadow: 0 0 0 1px currentColor inset;
        }

        .rr-ruled-input {
          background: transparent;
          border: none;
          border-bottom: 1.5px solid #C9BB9C;
          border-radius: 0;
          padding-left: 2px;
          color: #241C10;
        }
        .rr-ruled-input::placeholder { color: #A99A7A; }
        .rr-ruled-input:focus {
          outline: none;
          box-shadow: none;
          border-bottom-color: #B08968;
          border-bottom-width: 2px;
        }

        .rr-corner {
          position: relative;
          background: #FFFDF8;
          padding: 3px;
          border: 1px solid #E4D8BE;
        }

        @media (prefers-reduced-motion: no-preference) {
          .rr-row-enter { animation: rr-fade-up 0.35s ease both; }
        }
        @keyframes rr-fade-up {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.4] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4yIiAvPjwvc3ZnPg==')] bg-repeat"
        />

        {/* Plaque header */}
        <div className="rr-display bg-[#1F4738] rounded-t-md relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#D9C08F] to-transparent" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6 md:px-9 py-7">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full border-2 border-[#B08968] flex items-center justify-center shrink-0 bg-[#173328]">
                <User className="w-5 h-5 text-[#D9C08F]" strokeWidth={1.75} />
              </div>
              <div>
                <h1 className="text-3xl md:text-[2.4rem] leading-none font-semibold tracking-tight text-[#F6F1E7]">
                  The Reading Room
                </h1>
                <p className="rr-mono text-[11px] tracking-[0.2em] uppercase text-[#B9CDC1] mt-2">
                  Author Registry
                </p>
              </div>
            </div>
            {canModify && (
              <Link
                to="/authors/new"
                className="rr-mono inline-flex items-center justify-center gap-2 bg-[#D9C08F] hover:bg-[#E5CE9F] text-[#1F4738] rounded-sm px-5 py-2.5 transition-colors font-semibold text-xs uppercase tracking-wider shadow-sm"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Add Author
              </Link>
            )}
          </div>
        </div>

        {/* Search drawer */}
        <div className="bg-[#EFE6D3] border-x border-b border-[#D9C9A3] rounded-b-md shadow-[0_10px_25px_-15px_rgba(31,71,56,0.4)] mb-8 relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-[2px] w-16 h-[6px] bg-[#B08968] rounded-b-md" />
          <div className="p-6 md:p-7 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <div className="flex items-center gap-2.5">
                <Filter className="w-4 h-4 text-[#6B5B3F]" strokeWidth={2} />
                <span className="rr-mono text-[11px] uppercase tracking-[0.15em] text-[#4A3F2A] font-semibold">Search Authors</span>
                {activeFilters > 0 && (
                  <span className="rr-mono bg-[#1F4738] text-[#F6F1E7] text-[10px] px-2 py-0.5 rounded-sm tracking-wide">
                    {activeFilters} active
                  </span>
                )}
              </div>
              {activeFilters > 0 && (
                <button
                  onClick={clearFilters}
                  className="rr-mono flex items-center text-[11px] uppercase tracking-wide text-[#8A5A3F] hover:text-[#A63D2F] transition-colors"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="author-search" className="rr-mono text-[10px] text-[#4A3F2A] font-semibold tracking-[0.15em] uppercase">Name</Label>
                <Input
                  id="author-search"
                  type="text"
                  placeholder="Search by author name…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rr-ruled-input h-9 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-dashed border-[#D9C9A3]">
              <span className="rr-mono text-[10px] uppercase tracking-[0.15em] text-[#8A7A54]">Arrange by</span>
              <Select value={sortBy} onValueChange={(value) => { setPage(1); setSortBy(value); }}>
                <SelectTrigger className="rr-mono w-[125px] bg-[#F6F1E7] border-[#D9C9A3] text-[#4A3F2A] text-xs rounded-sm h-9">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="rr-mono bg-[#F6F1E7] border-[#D9C9A3] text-[#241C10]">
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="book_count">Book Count</SelectItem>
                </SelectContent>
              </Select>

              <Select value={order} onValueChange={(value) => { setPage(1); setOrder(value); }}>
                <SelectTrigger className="rr-mono w-[125px] bg-[#F6F1E7] border-[#D9C9A3] text-[#4A3F2A] text-xs rounded-sm h-9">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent className="rr-mono bg-[#F6F1E7] border-[#D9C9A3] text-[#241C10]">
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={String(limit)} onValueChange={(value) => { setPage(1); setLimit(Number(value)); }}>
                <SelectTrigger className="rr-mono w-[125px] bg-[#F6F1E7] border-[#D9C9A3] text-[#4A3F2A] text-xs rounded-sm h-9">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent className="rr-mono bg-[#F6F1E7] border-[#D9C9A3] text-[#241C10]">
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>

              <span className="rr-mono text-[11px] text-[#6B5B3F] ml-auto">
                {total} author{total !== 1 ? 's' : ''} registered
              </span>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-[#F6DED8] border-[#A63D2F]/40 text-[#7A2C21] rounded-sm">
            <AlertDescription className="rr-mono text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Author Table */}
        <Card className="border border-[#D9C9A3] shadow-[0_20px_40px_-24px_rgba(31,71,56,0.35)] bg-[#FFFDF8] rounded-md overflow-hidden">
          <CardHeader className="bg-[#FFFDF8] border-b-2 border-[#1F4738] py-5 px-7">
            <CardTitle className="rr-display text-[#1F4738] text-xl font-semibold tracking-tight">Author Roster</CardTitle>
            <CardDescription className="rr-mono text-[11px] text-[#4A3F2A] tracking-wide">Every contributor in the collection</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-72 gap-4">
                <div className="w-10 h-10 rounded-full border-[3px] border-[#E4D8BE] border-t-[#1F4738] animate-spin" />
                <span className="rr-mono text-[11px] uppercase tracking-[0.2em] text-[#8A7A54]">Retrieving records…</span>
              </div>
            ) : paginatedAuthors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-72 text-center px-4">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#D9C9A3] flex items-center justify-center mb-5">
                  <User className="w-7 h-7 text-[#B08968]" strokeWidth={1.5} />
                </div>
                <h3 className="rr-display text-2xl font-semibold text-[#1F4738]">No authors found</h3>
                <p className="text-[#6B5B3F] text-sm mt-2 max-w-sm">
                  {searchTerm ? 'Try adjusting your search term.' : 'Add a new author to the registry.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-[#1F4738] bg-[#1F4738] hover:bg-[#1F4738]">
                      <TableHead className="rr-mono py-4 px-6 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.15em] text-left align-middle w-[80px]">ID</TableHead>
                      <TableHead className="rr-mono py-4 px-6 text-[10px] font-semibold text-[#D9C08F] uppercase tracking-[0.15em] text-left align-middle">Name</TableHead>
                      <TableHead className="rr-mono py-4 px-6 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.15em] text-left align-middle w-[130px]">Book Count</TableHead>
                      {canModify && (
                        <TableHead className="rr-mono py-4 px-6 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.15em] text-right align-middle min-w-[130px]">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAuthors.map((author, idx) => (
                      <TableRow
                        key={author.id}
                        className={`rr-row-enter group cursor-pointer border-b border-[#E4D8BE] transition-colors duration-200 hover:bg-[#F1E4C4] ${idx % 2 === 1 ? 'bg-[#F6F1E7]' : 'bg-[#FFFDF8]'}`}
                        style={{ animationDelay: `${Math.min(idx, 12) * 25}ms` }}
                      >
                        <TableCell className="px-6 py-4 align-middle w-[80px] rr-mono text-sm text-[#4A3F2A]">
                          #{author.id}
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle text-[15px] rr-display font-semibold text-[#1F4738]">
                          {author.name}
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle w-[130px]">
                          <Badge variant="secondary" className="rr-mono bg-[#EFE6D3] border border-[#D9C9A3] text-[#4A3F2A] hover:bg-[#EFE6D3] rounded-sm px-3 py-1 font-medium text-[11px]">
                            {author.book_count} {author.book_count === 1 ? 'book' : 'books'}
                          </Badge>
                        </TableCell>
                        {canModify && (
                          <TableCell className="px-6 py-4 align-middle text-right min-w-[130px]">
                            <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-end gap-3">
                              <Link
                                to={`/authors/${author.id}/edit`}
                                className="rr-mono font-semibold text-[#1F4738] hover:text-[#0F2A20] transition-colors text-[11px] uppercase tracking-wide underline decoration-[#1F4738]/30 underline-offset-4 hover:decoration-[#1F4738]"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(author.id)}
                                className="rr-mono font-semibold text-[#A63D2F] hover:text-[#7A2C21] transition-colors text-[11px] uppercase tracking-wide underline decoration-[#A63D2F]/30 underline-offset-4 hover:decoration-[#A63D2F]"
                              >
                                Remove
                              </button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {!loading && paginatedAuthors.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-7 gap-4 px-1 pb-8">
            <div className="rr-mono text-[11px] text-[#6B5B3F] dark:text-[#F6F1E7] tracking-wide">
              Leaf <span className="font-semibold text-[#1F4738] dark:text-[#8BA695]">{page}</span> of <span className="font-semibold text-[#1F4738] dark:text-[#8BA695]">{totalPages}</span>
              <span className="ml-2 text-[#8A7A54] dark:text-[#F6F1E7]">({total} authors)</span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rr-mono border-[#D9C9A3] bg-[#FFFDF8] text-[#4A3F2A] hover:bg-[#EFE6D3] hover:text-[#1F4738] disabled:opacity-40 disabled:cursor-not-allowed rounded-sm transition-colors px-5 h-9 text-xs uppercase tracking-wide"
              >
                ← Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="rr-mono border-[#D9C9A3] bg-[#FFFDF8] text-[#4A3F2A] hover:bg-[#EFE6D3] hover:text-[#1F4738] disabled:opacity-40 disabled:cursor-not-allowed rounded-sm transition-colors px-5 h-9 text-xs uppercase tracking-wide"
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}