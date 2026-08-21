import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '@/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface List {
  id: number;
  name: string;
  description: string | null;
  book_count: number;
  created_at: string;
  updated_at: string;
}

export default function ListsPage() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New list form
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLists = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/lists');
      setLists(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError('List name is required');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await API.post('/lists', {
        name: newName.trim(),
        description: newDescription || null,
      });
      setSuccess('List created successfully');
      setIsDialogOpen(false);
      setNewName('');
      setNewDescription('');
      fetchLists();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteList = async (id: number) => {
    if (!window.confirm('Delete this list?')) return;
    try {
      await API.delete(`/lists/${id}`);
      setSuccess('List deleted');
      fetchLists();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete list');
    }
  };

  return (
    <div className="relative rr-scope min-h-screen bg-[#F6F1E7] dark:bg-[#0a0a0a] font-[500] antialiased pb-16">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Public+Sans:wght@400;500;600;700&display=swap');
        .rr-scope { font-family: 'Public Sans', ui-sans-serif, system-ui, sans-serif; color: #241C10; }
        .rr-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
        .rr-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }
        .rr-scope ::-webkit-scrollbar { height: 10px; width: 10px; }
        .rr-scope ::-webkit-scrollbar-track { background: #EFE6D3; }
        .rr-scope ::-webkit-scrollbar-thumb { background: #B08968; border-radius: 999px; border: 2px solid #EFE6D3; }
        .rr-card { background: #FFFDF8; border: 1px solid #D9C9A3; border-radius: 6px; }
        .rr-card-top { border-top: 3px solid #1F4738; }
        .rr-corner { position: relative; background: #FFFDF8; padding: 3px; border: 1px solid #E4D8BE; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.4] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4yIiAvPjwvc3ZnPg==')] bg-repeat"
        />

        {/* Plaque header */}
        <div className="rr-display bg-[#1F4738] rounded-t-md relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#D9C08F] to-transparent" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6 md:px-9 py-7">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full border-2 border-[#B08968] flex items-center justify-center shrink-0 bg-[#173328]">
                <BookOpen className="w-5 h-5 text-[#D9C08F]" strokeWidth={1.75} />
              </div>
              <div>
                <h1 className="text-3xl md:text-[2.2rem] leading-none font-semibold tracking-tight text-[#F6F1E7]">My Reading Lists</h1>
                <p className="rr-mono text-[11px] tracking-[0.2em] uppercase text-[#B9CDC1] mt-2">Custom Shelves &amp; Collections</p>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rr-mono inline-flex items-center justify-center gap-2 bg-[#D9C08F] hover:bg-[#E5CE9F] text-[#1F4738] rounded-sm px-5 py-2.5 h-auto transition-colors font-semibold text-xs uppercase tracking-wider shadow-sm">
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  New Shelf
                </Button>
              </DialogTrigger>
              <DialogContent className="rr-scope bg-[#FFFDF8] border-[#D9C9A3] text-[#241C10] rounded-md">
                <DialogHeader>
                  <DialogTitle className="rr-display text-[#1F4738] text-xl font-semibold">Create a New Shelf</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateList} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="list-name" className="rr-mono text-[10px] text-[#8A7A54] font-semibold tracking-[0.15em] uppercase">Shelf Name *</Label>
                    <Input
                      id="list-name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g., Books to Read"
                      className="bg-[#F6F1E7] border-[#D9C9A3] text-[#241C10] placeholder:text-[#A99A7A] focus-visible:ring-[#B08968] rounded-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="list-desc" className="rr-mono text-[10px] text-[#8A7A54] font-semibold tracking-[0.15em] uppercase">Description (optional)</Label>
                    <Textarea
                      id="list-desc"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="What's this list about?"
                      className="bg-[#F6F1E7] border-[#D9C9A3] text-[#241C10] placeholder:text-[#A99A7A] focus-visible:ring-[#B08968] rounded-sm"
                      rows={3}
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive" className="bg-[#F6DED8] border-[#A63D2F]/40 text-[#7A2C21] rounded-sm">
                      <AlertDescription className="rr-mono text-xs">{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="bg-[#E3EEE5] border-[#1F4738]/30 text-[#1F4738] rounded-sm">
                      <AlertDescription className="rr-mono text-xs">{success}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex justify-end gap-3 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="rr-mono border-[#D9C9A3] text-[#4A3F2A] hover:bg-[#EFE6D3] rounded-sm text-xs uppercase tracking-wide"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="rr-mono bg-[#1F4738] hover:bg-[#24543F] text-[#F6F1E7] rounded-sm px-6 text-xs uppercase tracking-wide"
                    >
                      {isSubmitting ? 'Creating…' : 'Create Shelf'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="w-10 h-10 rounded-full border-[3px] border-[#E4D8BE] border-t-[#1F4738] animate-spin" />
            <span className="rr-mono text-[11px] uppercase tracking-[0.2em] text-[#8A7A54]">Retrieving shelves…</span>
          </div>
        ) : lists.length === 0 ? (
          <div className="rr-card text-center p-14">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#D9C9A3] flex items-center justify-center mb-5 mx-auto">
              <BookOpen className="w-7 h-7 text-[#B08968]" strokeWidth={1.5} />
            </div>
            <h3 className="rr-display text-2xl font-semibold text-[#1F4738]">No shelves yet</h3>
            <p className="text-[#6B5B3F] text-sm mt-2">Create your first shelf to start organizing your books.</p>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              className="rr-mono mt-5 border-[#1F4738] text-[#1F4738] hover:bg-[#1F4738] hover:text-[#F6F1E7] rounded-sm text-xs uppercase tracking-wide"
            >
              <Plus className="w-3.5 h-3.5 mr-2" />
              Create Shelf
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div key={list.id} className="rr-card rr-card-top overflow-hidden shadow-[0_16px_32px_-24px_rgba(31,71,56,0.35)] hover:shadow-[0_18px_36px_-20px_rgba(31,71,56,0.4)] transition-shadow">
                <div className="border-b border-dashed border-[#E4D8BE] py-4 px-5">
                  <h3 className="rr-display text-[#1F4738] text-lg font-semibold truncate">{list.name}</h3>
                  {list.description && (
                    <p className="text-[#6B5B3F] text-sm mt-1 line-clamp-2">{list.description}</p>
                  )}
                </div>
                <div className="p-5">
                  <div className="rr-mono flex items-center justify-between text-[11px] text-[#8A7A54] dark:text-[#4A3F2A] mb-5 uppercase tracking-wide">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {list.book_count} volume{list.book_count !== 1 ? 's' : ''}
                    </span>
                    <span>{new Date(list.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/lists/${list.id}`} className="flex-1">
                      <Button className="rr-mono w-full bg-[#1F4738] hover:bg-[#24543F] text-[#F6F1E7] rounded-sm text-xs uppercase tracking-wide">
                        View Shelf
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteList(list.id)}
                      className="border-[#D9C9A3] text-[#A63D2F] hover:bg-[#F6DED8] hover:text-[#7A2C21] rounded-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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