import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '@/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface Author {
  id: number;
  name: string;
}

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const RR_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Public+Sans:wght@400;500;600;700&display=swap');
  .rr-scope { font-family: 'Public Sans', ui-sans-serif, system-ui, sans-serif; color: #241C10; }
  .rr-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
  .rr-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }
  .rr-scope ::-webkit-scrollbar { height: 10px; width: 10px; }
  .rr-scope ::-webkit-scrollbar-track { background: #EFE6D3; }
  .rr-scope ::-webkit-scrollbar-thumb { background: #B08968; border-radius: 999px; border: 2px solid #EFE6D3; }
  .rr-ruled-input {
    background: transparent; border: none; border-bottom: 1.5px solid #C9BB9C;
    border-radius: 0; padding-left: 2px; color: #241C10;
  }
  .rr-ruled-input::placeholder { color: #A99A7A; }
  .rr-ruled-input:focus { outline: none; box-shadow: none; border-bottom-color: #B08968; border-bottom-width: 2px; }
  .rr-corner { position: relative; background: #FFFDF8; padding: 3px; border: 1px solid #E4D8BE; }
`;

export default function BookFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // Core fields
  const [title, setTitle] = useState<string>('');
  const [authorId, setAuthorId] = useState<string>('');
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');

  // New fields
  const [genre, setGenre] = useState<string>('');
  const [publicationYear, setPublicationYear] = useState<string>('');
  const [isbn, setIsbn] = useState<string>('');

  const [authors, setAuthors] = useState<Author[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(isEdit);
  const [uploading, setUploading] = useState<boolean>(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await API.get('/authors');
        setAuthors(res.data);
      } catch (err) {
        console.error('Failed to fetch authors', err);
      }
    };
    fetchAuthors();
  }, []);

  useEffect(() => {
    if (isEdit) {
      const fetchBook = async () => {
        try {
          const res = await API.get(`/books/${id}`);
          const book = res.data;
          setTitle(book.title || '');
          setAuthorId(String(book.author_id || ''));
          setCoverImageUrl(book.cover_image_url || '');
          setGenre(book.genre || '');
          setPublicationYear(book.publication_year ? String(book.publication_year) : '');
          setIsbn(book.isbn || '');
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to fetch book');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchBook();
    }
  }, [id, isEdit]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setCoverImageUrl(data.secure_url);
      } else {
        setError('Upload failed: ' + (data.error?.message || 'Unknown error'));
      }
    } catch (err) {
      setError('Upload error');
    } finally {
      setUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!title.trim() || !authorId) {
      setError('Title and author are required');
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        title: title.trim(),
        authorId: Number(authorId),
      };
      if (coverImageUrl.trim()) payload.coverImageUrl = coverImageUrl.trim();
      if (genre.trim()) payload.genre = genre.trim();
      if (publicationYear.trim()) payload.publicationYear = Number(publicationYear.trim());
      if (isbn.trim()) payload.isbn = isbn.trim();

      if (isEdit) {
        await API.patch(`/books/${id}`, payload);
      } else {
        await API.post('/books', payload);
      }
      navigate('/books');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative rr-scope min-h-screen bg-[#F6F1E7] dark:bg-[#0a0a0a] font-[500] antialiased">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4yIiAvPjwvc3ZnPg==')] bg-repeat"
      />
      <style>{RR_STYLE}</style>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        <Link
          to="/books"
          className="rr-mono inline-flex items-center gap-1.5 text-[#F6F1E7] hover:text-[#1F4738] -ml-2 rounded-sm px-3 py-2 text-xs uppercase tracking-wide transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Books</span>
        </Link>

        <div className="bg-[#FFFDF8] border border-[#D9C9A3] shadow-[0_20px_40px_-24px_rgba(31,71,56,0.35)] rounded-md overflow-hidden">
          <div className="px-8 py-6 border-b-2 border-[#1F4738] flex items-center gap-4">
            <div className="w-11 h-11 rounded-full border-2 border-[#B08968] bg-[#F6F1E7] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-[#1F4738]" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="rr-display text-2xl font-semibold text-[#1F4738]">
                {isEdit ? 'Edit Book' : 'New Catalog Entry'}
              </h1>
              <p className="rr-mono text-[11px] text-[#4A3F2A] tracking-wide mt-0.5">
                {isEdit ? 'Update the details of this book.' : 'Add a new title to the collection.'}
              </p>
            </div>
          </div>

          <div className="p-8">
            {initialLoading ? (
              <div className="flex flex-col justify-center items-center h-40 gap-3">
                <div className="w-9 h-9 rounded-full border-[3px] border-[#E4D8BE] border-t-[#1F4738] animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" id="book-form">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="rr-mono text-[10px] text-[#4A3F2A] font-semibold tracking-[0.15em] uppercase">Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Enter book title"
                    className="rr-ruled-input h-10 text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="author" className="rr-mono text-[10px] text-[#4A3F2A] font-semibold tracking-[0.15em] uppercase">Author *</Label>
                  <Select
                    value={authorId}
                    onValueChange={(value) => setAuthorId(value)}
                    required
                  >
                    <SelectTrigger id="author" className="rr-mono bg-[#F6F1E7] border-[#D9C9A3] text-[#4A3F2A] text-sm rounded-sm h-10">
                      <SelectValue placeholder="Select an author" />
                    </SelectTrigger>
                    <SelectContent className="rr-mono bg-[#F6F1E7] border-[#D9C9A3] text-[#241C10]">
                      {authors.map((author) => (
                        <SelectItem key={author.id} value={String(author.id)}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="genre" className="rr-mono text-[10px] text-[#4A3F2A] font-semibold tracking-[0.15em] uppercase">Genre</Label>
                    <Input
                      id="genre"
                      type="text"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      placeholder="e.g. Fiction, Science"
                      className="rr-ruled-input h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="year" className="rr-mono text-[10px] text-[#4A3F2A] font-semibold tracking-[0.15em] uppercase">Publication Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={publicationYear}
                      onChange={(e) => setPublicationYear(e.target.value)}
                      placeholder="e.g. 2020"
                      className="rr-ruled-input h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="isbn" className="rr-mono text-[10px] text-[#4A3F2A] font-semibold tracking-[0.15em] uppercase">ISBN</Label>
                  <Input
                    id="isbn"
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="e.g. 978-3-16-148410-0"
                    className="rr-ruled-input h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cover" className="rr-mono text-[10px] text-[#4A3F2A] font-semibold tracking-[0.15em] uppercase">Cover Image</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="cover"
                      type="url"
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      placeholder="https://example.com/cover.jpg"
                      className="rr-ruled-input h-10 text-sm flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploading}
                      className="rr-mono border-[#D9C9A3] text-[#4A3F2A] hover:bg-[#EFE6D3] rounded-sm text-xs uppercase tracking-wide whitespace-nowrap h-10"
                    >
                      {uploading ? 'Uploading…' : 'Upload Cover'}
                    </Button>
                    <input
                      type="file"
                      ref={coverInputRef}
                      onChange={handleCoverUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  {coverImageUrl && (
                    <div className="rr-corner w-16 h-[5.5rem] mt-3 shadow-sm">
                      <img src={coverImageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-[#F6DED8] border-[#A63D2F]/40 text-[#7A2C21] rounded-sm">
                    <AlertDescription className="rr-mono text-xs">{error}</AlertDescription>
                  </Alert>
                )}
              </form>
            )}
          </div>

          {!initialLoading && (
            <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-dashed border-[#E4D8BE] bg-[#F6F1E7]">
              <Button
                type="button"
                onClick={() => navigate('/books')}
                variant="outline"
                className="rr-mono border-[#D9C9A3] text-[#4A3F2A] hover:bg-[#EFE6D3] rounded-sm text-xs uppercase tracking-wide"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="book-form"
                disabled={loading || uploading}
                className="rr-mono bg-[#1F4738] hover:bg-[#24543F] text-[#F6F1E7] rounded-sm px-6 text-xs uppercase tracking-wide"
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="w-3.5 h-3.5 mr-2 rounded-full border-2 border-[#F6F1E7]/40 border-t-[#F6F1E7] animate-spin" />
                    Saving…
                  </span>
                ) : (
                  isEdit ? 'Update Book' : 'Save Book'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}