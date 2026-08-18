import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '@/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

interface Author {
  id: number;
  name: string;
}

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function BookFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');
  const [authorId, setAuthorId] = useState<string>('');
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
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
          setTitle(res.data.title);
          setAuthorId(String(res.data.author_id));
          setCoverImageUrl(res.data.cover_image_url || '');
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
      const payload: any = { title: title.trim(), authorId: Number(authorId) };
      if (coverImageUrl.trim()) payload.coverImageUrl = coverImageUrl.trim();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 text-white font-sans antialiased">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-6">
          <Link
            to="/books"
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white hover:bg-white/10 -ml-2 rounded-xl px-3 py-2 text-sm font-medium transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Books</span>
          </Link>
        </div>

        <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="px-8 py-6 border-b border-white/10 bg-transparent">
            <CardTitle className="text-3xl font-bold text-white">
              {isEdit ? 'Edit Book' : 'Create New Book'}
            </CardTitle>
            <CardDescription className="text-slate-300 mt-1">
              {isEdit ? 'Update the details of this book.' : 'Add a new book to your collection.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {initialLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-200 font-medium">Title</Label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Enter book title"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:ring-2 focus:ring-indigo-400 focus:border-transparent rounded-xl transition-all py-3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author" className="text-slate-200 font-medium">Author</Label>
                  <Select
                    value={authorId}
                    onValueChange={(value) => setAuthorId(value)}
                    required
                  >
                    <SelectTrigger id="author" className="bg-white/10 border-white/20 text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent rounded-xl transition-all">
                      <SelectValue placeholder="Select an author" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10 text-white">
                      {authors.map((author) => (
                        <SelectItem key={author.id} value={String(author.id)}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover" className="text-slate-200 font-medium">Cover Image</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="cover"
                      type="url"
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      placeholder="https://example.com/cover.jpg"
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:ring-2 focus:ring-indigo-400 focus:border-transparent rounded-xl transition-all py-3 flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploading}
                      className="border-white/20 text-slate-200 hover:bg-white/10 rounded-xl transition-all whitespace-nowrap"
                    >
                      {uploading ? 'Uploading...' : 'Upload Cover'}
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
                    <div className="mt-2 rounded-lg overflow-hidden border border-white/10 max-w-[100px]">
                      <img src={coverImageUrl} alt="Cover preview" className="w-full h-auto" />
                    </div>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-500/20 border-red-400/30 text-red-200 backdrop-blur-sm rounded-xl">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </form>
            )}
          </CardContent>

          {!initialLoading && (
            <CardFooter className="flex items-center justify-end gap-3 px-8 py-4 border-t border-white/10 bg-white/5">
              <Button
                type="button"
                onClick={() => navigate('/books')}
                variant="outline"
                className="border-white/20 text-slate-200 hover:bg-white/10 rounded-xl transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('form')?.requestSubmit();
                }}
                disabled={loading || uploading}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl px-6 py-3 h-auto transition-all duration-300"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  isEdit ? 'Update Book' : 'Save Book'
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}