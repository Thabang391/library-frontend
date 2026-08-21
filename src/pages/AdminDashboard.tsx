import { useEffect, useState } from 'react';
import API from '@/api';
import { useAuth } from '@/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BookOpen, Users, User, BookMarked, AlertCircle, LockKeyhole } from 'lucide-react';

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

const COLORS = ['#1F4738', '#B08968', '#8A5A22', '#6B8F7F', '#A63D2F'];

const RR_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Public+Sans:wght@400;500;600;700&display=swap');
  .rr-scope { font-family: 'Public Sans', ui-sans-serif, system-ui, sans-serif; color: #241C10; }
  .rr-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
  .rr-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }
  .rr-scope ::-webkit-scrollbar { height: 10px; width: 10px; }
  .rr-scope ::-webkit-scrollbar-track { background: #EFE6D3; }
  .rr-scope ::-webkit-scrollbar-thumb { background: #B08968; border-radius: 999px; border: 2px solid #EFE6D3; }
  .rr-card { background: #FFFDF8; border: 1px solid #D9C9A3; border-radius: 6px; }
  .rr-stamp { transform: rotate(-4deg); border: 2px solid currentColor; border-radius: 3px; box-shadow: 0 0 0 1px currentColor inset; }
`;

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
    return (
      <div className="rr-scope min-h-screen flex items-center justify-center bg-[#F6F1E7]">
        <style>{RR_STYLE}</style>
        <div className="rr-card text-center px-10 py-12 max-w-sm">
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#D9C9A3] flex items-center justify-center mb-5 mx-auto">
            <LockKeyhole className="w-6 h-6 text-[#B08968]" strokeWidth={1.5} />
          </div>
          <h3 className="rr-display text-xl font-semibold text-[#1F4738]">Access Restricted</h3>
          <p className="text-[#6B5B3F] text-sm mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rr-scope min-h-screen flex flex-col items-center justify-center bg-[#F6F1E7] gap-4">
        <style>{RR_STYLE}</style>
        <div className="w-10 h-10 rounded-full border-[3px] border-[#E4D8BE] border-t-[#1F4738] animate-spin" />
        <span className="rr-mono text-[11px] uppercase tracking-[0.2em] text-[#8A7A54]">Tallying the ledgers…</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rr-scope min-h-screen flex items-center justify-center bg-[#F6F1E7]">
        <style>{RR_STYLE}</style>
        <div className="rr-card text-center px-10 py-12">
          <p className="rr-display text-xl text-[#1F4738] font-semibold">{error || 'Failed to load stats'}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Books', value: stats.totalBooks, icon: BookOpen },
    { title: 'Total Authors', value: stats.totalAuthors, icon: User },
    { title: 'Total Users', value: stats.totalUsers, icon: Users },
    { title: 'Active Loans', value: stats.activeLoans, icon: BookMarked },
    { title: 'Overdue Loans', value: stats.overdueLoans, icon: AlertCircle },
  ];

  return (
    <div className="relative rr-scope min-h-screen bg-[#F6F1E7] dark:bg-[#0a0a0a] font-[500] antialiased pb-16">

      <div
          className="absolute inset-0 pointer-events-none opacity-[0.4] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4yIiAvPjwvc3ZnPg==')] bg-repeat"
        />
      <style>{RR_STYLE}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Plaque header */}
        <div className="rr-display bg-[#1F4738] rounded-t-md relative overflow-hidden mb-8">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#D9C08F] to-transparent" />
          <div className="px-6 md:px-9 py-7">
            <h1 className="text-3xl md:text-[2.2rem] leading-none font-semibold tracking-tight text-[#F6F1E7]">Admin Dashboard</h1>
            <p className="rr-mono text-[11px] tracking-[0.2em] uppercase text-[#B9CDC1] mt-2">Library Operations Overview</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((stat, idx) => (
            <div key={idx} className="rr-card p-4 flex items-center justify-between">
              <div>
                <p className="rr-mono text-[10px] text-[#4A3F2A] uppercase tracking-[0.12em]">{stat.title}</p>
                <p className="rr-display text-2xl font-semibold text-[#1F4738] mt-0.5">{stat.value}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#EFE6D3] border border-[#D9C9A3] flex items-center justify-center shrink-0">
                <stat.icon className="w-4 h-4 text-[#8A5A22]" strokeWidth={1.75} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="rr-card overflow-hidden">
            <div className="border-b border-dashed border-[#E4D8BE] px-6 py-4">
              <h3 className="rr-display text-[#1F4738] text-lg font-semibold">Most Borrowed Books</h3>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.mostBorrowed} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D9C9A3" horizontal={false} />
                  <XAxis type="number" stroke="#4A3F2A" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                  <YAxis dataKey="title" type="category" stroke="#4A3F2A" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} width={110} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFDF8', borderColor: '#D9C9A3', color: '#241C10', fontFamily: 'IBM Plex Mono', fontSize: 12, borderRadius: 4 }}
                    cursor={{ fill: '#EFE6D3' }}
                  />
                  <Bar dataKey="loan_count" fill="#1F4738" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rr-card overflow-hidden">
            <div className="border-b border-dashed border-[#E4D8BE] px-6 py-4">
              <h3 className="rr-display text-[#1F4738] text-lg font-semibold">Avg Rating by Genre</h3>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.avgRatingByGenre}
                    dataKey="avg_rating"
                    nameKey="genre"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ genre, avg_rating }) => `${genre}: ${avg_rating}`}
                    labelLine={false}
                    style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: '#4A3F2A' }}
                  >
                    {stats.avgRatingByGenre.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#FFFDF8" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#FFFDF8', borderColor: '#D9C9A3', color: '#241C10', fontFamily: 'IBM Plex Mono', fontSize: 12, borderRadius: 4 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rr-card overflow-hidden">
          <div className="border-b border-dashed border-[#E4D8BE] px-6 py-4">
            <h3 className="rr-display text-[#1F4738] text-lg font-semibold">Recent Activity</h3>
          </div>
          <div className="p-2">
            {stats.recentActivity.length === 0 ? (
              <p className="text-[#8A7A54] text-sm px-4 py-6 text-center">No recent activity</p>
            ) : (
              stats.recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-[#EFE6D3] px-4 py-3 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`rr-stamp rr-mono shrink-0 inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                      activity.type === 'loan' ? 'text-[#1F4738]' : 'text-[#8A5A22]'
                    }`}>
                      {activity.type === 'loan' ? 'Borrowed' : 'Reviewed'}
                    </span>
                    <span className="text-sm font-semibold text-[#241C10] truncate">{activity.username}</span>
                    <span className="text-sm text-[#4A3F2A] truncate">— {activity.book_title}</span>
                  </div>
                  <span className="rr-mono text-[10px] text-[#4A3F2A] shrink-0 ml-3">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}