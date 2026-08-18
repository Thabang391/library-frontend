import { useEffect, useState } from 'react';
import API from '@/api';
import { useAuth } from '@/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  avatar_url?: string;
  created_at: string;
}

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
    return <div className="text-white p-8">You do not have permission to view this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 text-white font-sans antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>

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

        <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-transparent border-b border-white/10 py-5">
            <CardTitle className="text-white text-xl font-bold">Manage Users</CardTitle>
            <CardDescription className="text-slate-300">View and update user roles</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <p className="text-slate-300">No users found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/10 hover:bg-white/5">
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} className="border-b border-white/5 transition-all hover:bg-white/5">
                      <TableCell className="px-6 py-4 text-sm font-mono text-slate-400">#{u.id}</TableCell>
                      <TableCell className="px-6 py-4 text-sm font-semibold text-white">{u.username}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-slate-300">{u.email}</TableCell>
                      <TableCell className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                          u.role === 'librarian' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-slate-500/20 text-slate-300'
                        }`}>
                          {u.role}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Select
                          value={u.role}
                          onValueChange={(val) => handleRoleChange(u.id, val)}
                        >
                          <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white focus:ring-indigo-400 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/10 text-white">
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}