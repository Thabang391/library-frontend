import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '@/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Trash2, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Book {
  id: number;
  title: string;
  author: string;
  cover_image_url?: string;
  genre?: string;
  publication_year?: number;
  added_at: string;
}

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800">
        <div className="text-white text-center">
          <p className="text-xl">{error || 'List not found'}</p>
          <Link to="/lists" className="text-indigo-300 hover:text-indigo-100 mt-4 inline-block">
            Back to Lists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-white font-sans antialiased pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/lists" className="text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
              {list.name}
            </h1>
            {list.description && <p className="text-slate-300 mt-1">{list.description}</p>}
          </div>
          <span className="ml-auto text-sm text-slate-400 flex items-center">
            <BookOpen className="w-4 h-4 mr-1" />
            {books.length} books
          </span>
        </div>

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

        {books.length === 0 ? (
          <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden p-12 text-center">
            <svg className="w-16 h-16 text-slate-500 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <h3 className="text-xl font-semibold text-white">No books in this list</h3>
            <p className="text-slate-300 text-sm mt-1">Go to the Books page to add books to this list.</p>
            <Link to="/books">
              <Button variant="outline" className="mt-4 border-white/20 text-slate-200 hover:bg-white/10 rounded-xl">
                Browse Books
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card key={book.id} className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden group hover:shadow-indigo-500/10 transition-all">
                <div className="flex">
                  <div className="flex-shrink-0 w-24 h-32">
                    {book.cover_image_url ? (
                      <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-400 text-xs">No cover</div>
                    )}
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link to={`/books/${book.id}`} className="hover:text-indigo-300 transition-colors">
                        <h3 className="text-white font-semibold text-lg line-clamp-1">{book.title}</h3>
                      </Link>
                      <p className="text-slate-300 text-sm">{book.author}</p>
                      <div className="flex gap-2 mt-1 text-xs text-slate-400">
                        {book.genre && <Badge variant="outline" className="text-slate-300 border-white/20">{book.genre}</Badge>}
                        {book.publication_year && <span>{book.publication_year}</span>}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-slate-400">Added {new Date(book.added_at).toLocaleDateString()}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBook(book.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}