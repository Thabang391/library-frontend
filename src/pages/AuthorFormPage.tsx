import API from '@/api';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, User } from 'lucide-react';

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
`;

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
    <div className="relative rr-scope min-h-screen bg-[#F6F1E7] dark:bg-[#0a0a0a] font-[500] antialiased">
      <div
          className="absolute inset-0 pointer-events-none opacity-[0.4] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4yIiAvPjwvc3ZnPg==')] bg-repeat"
        />
      <style>{RR_STYLE}</style>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        <Link
          to="/authors"
          className="rr-mono inline-flex items-center gap-1.5 text-[#F6F1E7] hover:text-[#1F4738] -ml-2 rounded-sm px-3 py-2 text-xs uppercase tracking-wide transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Authors</span>
        </Link>

        <div className="bg-[#FFFDF8] border border-[#D9C9A3] shadow-[0_20px_40px_-24px_rgba(31,71,56,0.35)] rounded-md overflow-hidden">
          <div className="px-8 py-6 border-b-2 border-[#1F4738] flex items-center gap-4">
            <div className="w-11 h-11 rounded-full border-2 border-[#B08968] bg-[#F6F1E7] flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-[#1F4738]" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="rr-display text-2xl font-semibold text-[#1F4738]">
                {isEdit ? 'Edit Author' : 'New Author Entry'}
              </h1>
              <p className="rr-mono text-[11px] text-[#4A3F2A] tracking-wide mt-0.5">
                {isEdit ? 'Update the details of this author.' : 'Add a new author to the catalog.'}
              </p>
            </div>
          </div>

          <div className="p-8">
            {initialLoading ? (
              <div className="flex flex-col justify-center items-center h-40 gap-3">
                <div className="w-9 h-9 rounded-full border-[3px] border-[#E4D8BE] border-t-[#1F4738] animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" id="author-form">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="rr-mono text-[10px] text-[#4A3F2A] font-semibold tracking-[0.15em] uppercase">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter author's name"
                    className="rr-ruled-input h-10 text-base"
                  />
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
                onClick={() => navigate('/authors')}
                variant="outline"
                className="rr-mono border-[#D9C9A3] text-[#4A3F2A] hover:bg-[#EFE6D3] rounded-sm text-xs uppercase tracking-wide"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="author-form"
                disabled={loading}
                className="rr-mono bg-[#1F4738] hover:bg-[#24543F] text-[#F6F1E7] rounded-sm px-6 text-xs uppercase tracking-wide"
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="w-3.5 h-3.5 mr-2 rounded-full border-2 border-[#F6F1E7]/40 border-t-[#F6F1E7] animate-spin" />
                    Saving…
                  </span>
                ) : (
                  isEdit ? 'Update Author' : 'Save Author'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}