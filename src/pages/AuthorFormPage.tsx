import API from '@/api';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';

export default function AuthorFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(isEdit);

  useEffect(() => {
    if (isEdit) {
      const fetchAuthor = async () => {
        try {
          const res = await API.get(`/authors/${id}`);
          setName(res.data.name);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to fetch author');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchAuthor();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    try {
      const payload = { name: name.trim() };
      if (isEdit) {
        await API.patch(`/authors/${id}`, payload);
      } else {
        await API.post('/authors', payload);
      }
      navigate('/authors');
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
  to="/authors" 
  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white hover:bg-white/10 -ml-2 rounded-xl px-3 py-2 text-sm font-medium transition-all"
>
  <ArrowLeft className="w-5 h-5" />
  <span>Back to Authors</span>
</Link>
        </div>

        <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="px-8 py-6 border-b border-white/10 bg-transparent">
            <CardTitle className="text-3xl font-bold text-white">
              {isEdit ? 'Edit Author' : 'Create New Author'}
            </CardTitle>
            <CardDescription className="text-slate-300 mt-1">
              {isEdit ? 'Update the details of this author.' : 'Add a new author to your library.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {initialLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" id="author-form">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-200 font-medium">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter author's name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:ring-2 focus:ring-indigo-400 focus:border-transparent rounded-xl transition-all py-3"
                  />
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
                onClick={() => navigate('/authors')} 
                variant="outline"
                className="border-white/20 text-slate-200 hover:bg-white/10 rounded-xl transition-all"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                form="author-form"
                disabled={loading}
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
                  isEdit ? 'Update Author' : 'Save Author'
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}