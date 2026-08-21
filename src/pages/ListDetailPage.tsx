import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '@/api';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Trash2, BookOpen } from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  cover_image_url?: string;
  genre?: string;
  publication_year?: number;
  added_at: string;
}

const RR_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Public+Sans:wght@400;500;600;700&display=swap');
  .rr-scope { font-family: 'Public Sans', ui-sans-serif, system-ui, sans-serif; color: #241C10; }
  .rr-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
  .rr-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }
  .rr-scope ::-webkit-scrollbar { height: 10px; width: 10px; }
  .rr-scope ::-webkit-scrollbar-track { background: #EFE6D3; }
  .rr-scope ::-webkit-scrollbar-thumb { background: #B08968; border-radius: 999px; border: 2px solid #EFE6D3; }
  .rr-card { background: #FFFDF8; border: 1px solid #D9C9A3; border-radius: 6px; }
  .rr-corner { position: relative; background: #FFFDF8; padding: 3px; border: 1px solid #E4D8BE; }
`;

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<{ name: string; description: string | null } | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchListAndBooks = async () => {
    setLoading(true);
    setError('');
    try {
      // First, get list details (we need name)
      const listRes = await API.get('/lists'); // get all lists to find the current one
      const lists = listRes.data;
      const currentList = lists.find((l: any) => l.id === Number(id));
      if (!currentList) {
        setError('List not found');
        setLoading(false);
        return;
      }
      setList({ name: currentList.name, description: currentList.description });

      // Then get books in this list
      const booksRes = await API.get(`/lists/${id}/books`);
      setBooks(booksRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListAndBooks();
  }, [id]);

  const handleRemoveBook = async (bookId: number) => {
    if (!window.confirm('Remove this book from the list?')) return;
    try {
      await API.delete(`/lists/${id}/books/${bookId}`);
      setSuccess('Book removed from list');
      fetchListAndBooks(); // refresh
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove book');
    }
  };

  if (loading) {
    return (
      <div className="rr-scope min-h-screen flex flex-col items-center justify-center bg-[#F6F1E7] gap-4">
        <style>{RR_STYLE}</style>
        <div className="w-10 h-10 rounded-full border-[3px] border-[#E4D8BE] border-t-[#1F4738] animate-spin" />
        <span className="rr-mono text-[11px] uppercase tracking-[0.2em] text-[#8A7A54]">Retrieving records…</span>
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="rr-scope min-h-screen flex items-center justify-center bg-[#F6F1E7]">
        <style>{RR_STYLE}</style>
        <div className="rr-card text-center px-10 py-12">
          <p className="rr-display text-xl text-[#1F4738] font-semibold">{error || 'List not found'}</p>
          <Link to="/lists" className="rr-mono inline-block mt-4 text-xs uppercase tracking-wide text-[#8A5A3F] hover:text-[#1F4738] transition-colors">
            ← Back to Lists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rr-scope min-h-screen bg-[#F6F1E7] dark:bg-[#0a0a0a] font-[500] antialiased pb-16">
      <div
          className="absolute inset-0 pointer-events-none opacity-[0.4] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4yIiAvPjwvc3ZnPg==')] bg-repeat"
        />
      <style>{RR_STYLE}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Plaque header */}
        <div className="rr-display bg-[#1F4738] rounded-t-md relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#D9C08F] to-transparent" />
          <div className="flex items-center gap-4 px-6 md:px-9 py-7">
            <Link to="/lists" className="text-[#B9CDC1] hover:text-[#F6F1E7] transition-colors shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-[2rem] leading-tight font-semibold tracking-tight text-[#F6F1E7] truncate">
                {list.name}
              </h1>
              {list.description && (
                <p className="text-[#B9CDC1] text-sm mt-1 max-w-xl">{list.description}</p>
              )}
            </div>
            <span className="rr-mono ml-auto shrink-0 text-[11px] uppercase tracking-[0.15em] text-[#D9C08F] flex items-center gap-1.5 bg-[#173328] border border-[#B08968]/40 rounded-sm px-3 py-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {books.length} volume{books.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="h-8 bg-[#EFE6D3] border-x border-b border-[#D9C9A3] rounded-b-md mb-8" />

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

        {books.length === 0 ? (
          <div className="rr-card text-center p-14">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#D9C9A3] flex items-center justify-center mb-5 mx-auto">
              <BookOpen className="w-7 h-7 text-[#B08968]" strokeWidth={1.5} />
            </div>
            <h3 className="rr-display text-2xl font-semibold text-[#1F4738]">This shelf is empty</h3>
            <p className="text-[#6B5B3F] text-sm mt-2">Go to the Books page to add titles to this shelf.</p>
            <Link to="/books">
              <Button variant="outline" className="rr-mono mt-5 border-[#1F4738] text-[#1F4738] hover:bg-[#1F4738] hover:text-[#F6F1E7] rounded-sm text-xs uppercase tracking-wide">
                Browse Books
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div key={book.id} className="rr-card overflow-hidden shadow-[0_16px_32px_-24px_rgba(31,71,56,0.35)] hover:shadow-[0_18px_36px_-20px_rgba(31,71,56,0.4)] transition-shadow">
                <div className="flex">
                  <div className="flex-shrink-0 p-3">
                    <div className="rr-corner w-[4.5rem] h-[6.2rem]">
                      {book.cover_image_url ? (
                        <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#EFE6D3] text-[#8A7A54] text-[9px] font-medium text-center leading-tight px-1">No cover</div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 pl-1 flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <Link to={`/books/${book.id}`} className="hover:text-[#B08968] transition-colors">
                        <h3 className="rr-display text-[#1F4738] font-semibold text-lg leading-snug line-clamp-1">{book.title}</h3>
                      </Link>
                      <p className="text-[#6B5B3F] text-sm mt-0.5">{book.author}</p>
                      <div className="flex flex-wrap gap-2 mt-2 items-center">
                        {book.genre && (
                          <span className="rr-mono text-[10px] uppercase tracking-wide text-[#6B5B3F] bg-[#EFE6D3] border border-[#D9C9A3] rounded-sm px-2 py-0.5">
                            {book.genre}
                          </span>
                        )}
                        {book.publication_year && (
                          <span className="rr-mono text-[11px] text-[#8A7A54]">{book.publication_year}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="rr-mono text-[10px] text-[#A99A7A] uppercase tracking-wide">
                        Added {new Date(book.added_at).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBook(book.id)}
                        className="text-[#A63D2F] hover:text-[#7A2C21] hover:bg-[#F6DED8] rounded-sm h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}