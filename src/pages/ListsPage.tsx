import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '@/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Edit, BookOpen } from 'lucide-react';
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
    <div className="min-h-screen bg-white dark:bg-slate-900 text-white font-sans antialiased pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">My Lists</h1>
            <p className="text-slate-300 mt-1">Organize your books into custom collections</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl px-6 py-3 transition-all duration-300">
                <Plus className="w-5 h-5 mr-2" />
                Create New List
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Create New List</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateList} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="list-name" className="text-slate-300">List Name *</Label>
                  <Input
                    id="list-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Books to Read"
                    className="bg-slate-900/50 border-white/20 text-white placeholder:text-slate-500 focus:ring-indigo-400 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="list-desc" className="text-slate-300">Description (optional)</Label>
                  <Textarea
                    id="list-desc"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="What's this list about?"
                    className="bg-slate-900/50 border-white/20 text-white placeholder:text-slate-500 focus:ring-indigo-400 rounded-xl"
                    rows={3}
                  />
                </div>
                {error && (
                  <Alert variant="destructive" className="bg-red-500/20 border-red-400/30 text-red-200 rounded-xl">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-green-500/20 border-green-400/30 text-green-200 rounded-xl">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-white/20 text-slate-200 hover:bg-white/10 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl px-6 py-2"
                  >
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
          </div>
        ) : lists.length === 0 ? (
          <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden p-12 text-center">
            <svg className="w-16 h-16 text-slate-500 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <h3 className="text-xl font-semibold text-white">No lists yet</h3>
            <p className="text-slate-300 text-sm mt-1">Create your first list to start organizing your books.</p>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              className="mt-4 border-white/20 text-slate-200 hover:bg-white/10 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create List
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <Card key={list.id} className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden hover:shadow-indigo-500/10 transition-all">
                <CardHeader className="border-b border-white/10 py-4">
                  <CardTitle className="text-white text-lg font-bold truncate">{list.name}</CardTitle>
                  {list.description && (
                    <CardDescription className="text-slate-300 text-sm line-clamp-2">{list.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                    <span className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {list.book_count} books
                    </span>
                    <span>Created {new Date(list.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/lists/${list.id}`} className="flex-1">
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteList(list.id)}
                      className="border-white/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}