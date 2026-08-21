import { useEffect, useState } from 'react';
import API from '@/api';
import { useAuth } from '@/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LockKeyhole, BookOpen } from 'lucide-react';

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  avatar_url?: string;
  created_at: string;
}

const RR_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Public+Sans:wght@400;500;600;700&display=swap');
  .rr-scope { font-family: 'Public Sans', ui-sans-serif, system-ui, sans-serif; color: #241C10; }
  .rr-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
  .rr-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }
  .rr-scope ::-webkit-scrollbar { height: 10px; width: 10px; }
  .rr-scope ::-webkit-scrollbar-track { background: #EFE6D3; }
  .rr-scope ::-webkit-scrollbar-thumb { background: #B08968; border-radius: 999px; border: 2px solid #EFE6D3; }
  .rr-stamp { transform: rotate(-4deg); border: 2px solid currentColor; border-radius: 3px; box-shadow: 0 0 0 1px currentColor inset; }
`;

const roleInk: Record<string, string> = {
  admin: '#A63D2F',
  librarian: '#1F4738',
  member: '#8A5A22',
};

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/users');
      setUsers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await API.patch(`/users/${userId}/role`, { role: newRole });
      setSuccess(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="rr-scope min-h-screen flex items-center justify-center bg-[#F6F1E7] dark:bg-[#0a0a0a]">
        <style>{RR_STYLE}</style>
        <div className="bg-[#FFFDF8] border border-[#D9C9A3] rounded-md text-center px-10 py-12 max-w-sm">
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#D9C9A3] flex items-center justify-center mb-5 mx-auto">
            <LockKeyhole className="w-6 h-6 text-[#B08968]" strokeWidth={1.5} />
          </div>
          <h3 className="rr-display text-xl font-semibold text-[#1F4738]">Access Restricted</h3>
          <p className="text-[#6B5B3F] text-sm mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rr-scope min-h-screen bg-[#F6F1E7] dark:bg-[#0a0a0a] font-[500] antialiased py-12 px-4 sm:px-6 lg:px-8">

      <div
          className="absolute inset-0 pointer-events-none opacity-[0.4] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4yIiAvPjwvc3ZnPg==')] bg-repeat"
        />
      <style>{RR_STYLE}</style>
      
      <div className="max-w-6xl mx-auto">

        {/* Plaque header */}
        <div className="rr-display bg-[#1F4738] rounded-t-md relative overflow-hidden mb-8">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#D9C08F] to-transparent" />
          <div className="px-6 md:px-9 py-7">
            <h1 className="text-3xl md:text-[2.2rem] leading-none font-semibold tracking-tight text-[#F6F1E7]">Admin Panel</h1>
            <p className="rr-mono text-[11px] tracking-[0.2em] uppercase text-[#B9CDC1] mt-2">Membership Register</p>
          </div>
        </div>

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

        <div className="bg-[#FFFDF8] border border-[#D9C9A3] shadow-[0_20px_40px_-24px_rgba(31,71,56,0.35)] rounded-md overflow-hidden">
          <div className="border-b-2 border-[#1F4738] py-5 px-7">
            <h2 className="rr-display text-[#1F4738] text-xl font-semibold tracking-tight">Manage Users</h2>
            <p className="rr-mono text-[11px] text-[#4A3F2A] tracking-wide mt-0.5">View and update user roles</p>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
              <div className="w-10 h-10 rounded-full border-[3px] border-[#E4D8BE] border-t-[#1F4738] animate-spin" />
              <span className="rr-mono text-[11px] uppercase tracking-[0.2em] text-[#8A7A54]">Retrieving records…</span>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#D9C9A3] flex items-center justify-center mb-5">
                <BookOpen className="w-7 h-7 text-[#B08968]" strokeWidth={1.5} />
              </div>
              <p className="text-[#6B5B3F] text-sm">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-[#1F4738] bg-[#1F4738] hover:bg-[#1F4738]">
                    <TableHead className="rr-mono py-4 px-6 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.15em]">ID</TableHead>
                    <TableHead className="rr-mono py-4 px-6 text-[10px] font-semibold text-[#D9C08F] uppercase tracking-[0.15em]">Username</TableHead>
                    <TableHead className="rr-mono py-4 px-6 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.15em]">Email</TableHead>
                    <TableHead className="rr-mono py-4 px-6 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.15em]">Role</TableHead>
                    <TableHead className="rr-mono py-4 px-6 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.15em] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u, idx) => (
                    <TableRow
                      key={u.id}
                      className={`border-b border-[#E4D8BE] transition-colors hover:bg-[#F1E4C4] ${idx % 2 === 1 ? 'bg-[#F6F1E7]' : 'bg-[#FFFDF8]'}`}
                    >
                      <TableCell className="rr-mono px-6 py-4 text-sm text-[#4A3F2A]">#{u.id}</TableCell>
                      <TableCell className="px-6 py-4 text-[15px] rr-display font-semibold text-[#1F4738]">{u.username}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-[#4A3F2A]">{u.email}</TableCell>
                      <TableCell className="px-6 py-4">
                        <span
                          className="rr-stamp rr-mono inline-block text-[9px] font-bold uppercase tracking-wider px-2.5 py-1"
                          style={{ color: roleInk[u.role] || '#8A5A22' }}
                        >
                          {u.role}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Select
                          value={u.role}
                          onValueChange={(val) => handleRoleChange(u.id, val)}
                        >
                          <SelectTrigger className="rr-mono w-[140px] ml-auto bg-[#F6F1E7] border-[#D9C9A3] text-[#4A3F2A] text-xs rounded-sm h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rr-mono bg-[#F6F1E7] border-[#D9C9A3] text-[#241C10]">
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="librarian">Librarian</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}