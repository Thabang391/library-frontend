import { useEffect, useState } from 'react';
import API from '@/api';
import { useAuth } from '@/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BookOpen, Users, User, BookMarked, AlertCircle } from 'lucide-react';

interface Stats {
  totalBooks: number;
  totalAuthors: number;
  totalUsers: number;
  activeLoans: number;
  overdueLoans: number;
  mostBorrowed: Array<{ id: number; title: string; author: string; loan_count: number }>;
  avgRatingByGenre: Array<{ genre: string; avg_rating: number; review_count: number }>;
  recentActivity: Array<{ type: string; id: number; created_at: string; username: string; book_title: string }>;
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await API.get('/admin/stats');
        setStats(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (user?.role !== 'admin') {
    return <div className="text-white p-8">You do not have permission to view this page.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  if (error || !stats) {
    return <div className="text-white p-8">{error || 'Failed to load stats'}</div>;
  }

  const statCards = [
    { title: 'Total Books', value: stats.totalBooks, icon: BookOpen, color: 'text-indigo-400' },
    { title: 'Total Authors', value: stats.totalAuthors, icon: User, color: 'text-emerald-400' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
    { title: 'Active Loans', value: stats.activeLoans, icon: BookMarked, color: 'text-yellow-400' },
    { title: 'Overdue Loans', value: stats.overdueLoans, icon: AlertCircle, color: 'text-red-400' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-white font-sans antialiased pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((stat, idx) => (
            <Card key={idx} className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts: Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Most Borrowed Books */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Most Borrowed Books</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.mostBorrowed} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="title" type="category" stroke="#94a3b8" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                  <Bar dataKey="loan_count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Avg Rating by Genre (Pie) */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Avg Rating by Genre</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.avgRatingByGenre}
                    dataKey="avg_rating"
                    nameKey="genre"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ genre, avg_rating }) => `${genre}: ${avg_rating}`}
                    labelLine={false}
                  >
                    {stats.avgRatingByGenre.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentActivity.length === 0 ? (
                <p className="text-slate-400">No recent activity</p>
              ) : (
                stats.recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-white/5 py-2 last:border-0">
                    <div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        activity.type === 'loan' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {activity.type === 'loan' ? 'Borrowed' : 'Reviewed'}
                      </span>
                      <span className="text-sm text-white ml-2">{activity.username}</span>
                      <span className="text-sm text-slate-400 ml-2">- {activity.book_title}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}