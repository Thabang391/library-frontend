// components/AddToListPopover.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/AuthContext';
import API from '@/api';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface List {
  id: number;
  name: string;
}

interface AddToListPopoverProps {
  bookId: number;
  trigger: React.ReactNode;
}

export default function AddToListPopover({ bookId, trigger }: AddToListPopoverProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<List[]>([]);
  const [checkedLists, setCheckedLists] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all lists and checked lists when popover opens
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [allListsRes, checkedRes] = await Promise.all([
        API.get('/lists'),
        API.get(`/lists/check?bookId=${bookId}`),
      ]);
      setLists(allListsRes.data);
      setCheckedLists(checkedRes.data.map((l: any) => l.id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, bookId]);

  const handleToggleList = async (listId: number) => {
    const isChecked = checkedLists.includes(listId);
    try {
      if (isChecked) {
        await API.delete(`/lists/${listId}/books/${bookId}`);
        setCheckedLists((prev) => prev.filter((id) => id !== listId));
        setSuccess('Removed from list');
      } else {
        await API.post(`/lists/${listId}/books`, { bookId });
        setCheckedLists((prev) => [...prev, listId]);
        setSuccess('Added to list');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update list');
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);
    setError('');
    try {
      await API.post('/lists', {
        name: newName.trim(),
        description: newDescription || null,
      });
      setSuccess('List created!');
      setIsDialogOpen(false);
      setNewName('');
      setNewDescription('');
      fetchData(); // refresh lists
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create list');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className="w-72 p-0 bg-slate-800 border-white/10 text-white" align="start">
          <Command>
            <CommandInput placeholder="Search lists..." className="text-white placeholder:text-slate-400" />
            <CommandList>
              <CommandEmpty>No lists found.</CommandEmpty>
              <CommandGroup>
                {loading ? (
                  <div className="p-4 text-center text-slate-400">Loading...</div>
                ) : (
                  lists.map((list) => {
                    const isChecked = checkedLists.includes(list.id);
                    return (
                      <CommandItem
                        key={list.id}
                        onSelect={() => handleToggleList(list.id)}
                        className="flex items-center justify-between text-white hover:bg-white/10 cursor-pointer"
                      >
                        <span>{list.name}</span>
                        {isChecked && <Check className="w-4 h-4 text-indigo-400" />}
                      </CommandItem>
                    );
                  })
                )}
                <CommandItem
                  onSelect={() => setIsDialogOpen(true)}
                  className="flex items-center gap-2 text-indigo-300 hover:bg-white/10 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Create new list
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
          {error && <p className="text-xs text-red-400 p-2">{error}</p>}
          {success && <p className="text-xs text-green-400 p-2">{success}</p>}
        </PopoverContent>
      </Popover>

      {/* Dialog for creating a new list */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-800 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Create New List</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateList} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-list-name" className="text-slate-300">List Name *</Label>
              <Input
                id="new-list-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Books to Read"
                className="bg-slate-900/50 border-white/20 text-white placeholder:text-slate-500 focus:ring-indigo-400 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-list-desc" className="text-slate-300">Description (optional)</Label>
              <Textarea
                id="new-list-desc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="What's this list about?"
                className="bg-slate-900/50 border-white/20 text-white placeholder:text-slate-500 focus:ring-indigo-400 rounded-xl"
                rows={3}
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
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
    </>
  );
}