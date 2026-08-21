// components/AddToListPopover.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/AuthContext';
import API from '@/api';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

const RR_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Public+Sans:wght@400;500;600;700&display=swap');
  .rr-popover-scope { font-family: 'Public Sans', ui-sans-serif, system-ui, sans-serif; color: #241C10; }
  .rr-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
  .rr-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }
  .rr-ruled-input {
    background: transparent; border: none; border-bottom: 1.5px solid #C9BB9C;
    border-radius: 0; padding-left: 2px; color: #241C10;
  }
  .rr-ruled-input::placeholder { color: #A99A7A; }
  .rr-ruled-input:focus { outline: none; box-shadow: none; border-bottom-color: #B08968; border-bottom-width: 2px; }
`;

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
    <div className="rr-popover-scope">
      <style>{RR_STYLE}</style>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className="rr-popover-scope w-72 p-0 bg-[#FFFDF8] border-[#D9C9A3] text-[#241C10] rounded-md" align="start">
          <Command className="bg-transparent">
            <CommandInput placeholder="Search shelves…" className="rr-mono text-sm text-[#241C10] placeholder:text-[#A99A7A]" />
            <CommandList>
              <CommandEmpty className="rr-mono text-xs text-[#8A7A54] py-4">No shelves found.</CommandEmpty>
              <CommandGroup>
                {loading ? (
                  <div className="rr-mono p-4 text-center text-xs text-[#8A7A54] uppercase tracking-wide">Loading…</div>
                ) : (
                  lists.map((list) => {
                    const isChecked = checkedLists.includes(list.id);
                    return (
                      <CommandItem
                        key={list.id}
                        onSelect={() => handleToggleList(list.id)}
                        className="flex items-center justify-between text-[#241C10] hover:bg-[#EFE6D3] cursor-pointer rounded-sm"
                      >
                        <span className="text-sm">{list.name}</span>
                        {isChecked && <Check className="w-4 h-4 text-[#1F4738]" />}
                      </CommandItem>
                    );
                  })
                )}
                <CommandItem
                  onSelect={() => setIsDialogOpen(true)}
                  className="rr-mono flex items-center gap-2 text-[11px] uppercase tracking-wide text-[#1F4738] font-semibold hover:bg-[#EFE6D3] cursor-pointer rounded-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create new shelf
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
          {error && <p className="rr-mono text-[10px] uppercase tracking-wide text-[#A63D2F] p-2">{error}</p>}
          {success && <p className="rr-mono text-[10px] uppercase tracking-wide text-[#1F4738] p-2">{success}</p>}
        </PopoverContent>
      </Popover>

      {/* Dialog for creating a new list */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rr-popover-scope bg-[#FFFDF8] border-[#D9C9A3] text-[#241C10] rounded-md">
          <DialogHeader>
            <DialogTitle className="rr-display text-[#1F4738] text-xl font-semibold">Create a New Shelf</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateList} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-list-name" className="rr-mono text-[10px] text-[#8A7A54] font-semibold tracking-[0.15em] uppercase">Shelf Name *</Label>
              <Input
                id="new-list-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Books to Read"
                className="rr-ruled-input h-9 text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-list-desc" className="rr-mono text-[10px] text-[#8A7A54] font-semibold tracking-[0.15em] uppercase">Description (optional)</Label>
              <Textarea
                id="new-list-desc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="What's this list about?"
                className="bg-[#F6F1E7] border-[#D9C9A3] text-[#241C10] placeholder:text-[#A99A7A] focus-visible:ring-[#B08968] rounded-sm"
                rows={3}
              />
            </div>
            {error && <p className="rr-mono text-[10px] uppercase tracking-wide text-[#A63D2F]">{error}</p>}
            <div className="flex justify-end gap-3">
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
                {isSubmitting ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}