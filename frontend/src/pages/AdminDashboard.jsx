import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, getAllUsers, updateUserRole } from '../api/admin';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  School,
  TrendingUp,
  LogOut,
  Search,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        getAdminStats().catch(() => null),
        getAllUsers().catch(() => []),
      ]);
      setStats(statsData);
      setUsersList(usersData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      showToast('Роль пользователя успешно обновлена!');
    } catch (err) {
      alert('Ошибка при обновлении роли');
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900/80 border-r border-slate-800/80 p-6 flex flex-col justify-between shrink-0 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-md">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-white text-base truncate">{user?.name || 'Администратор'}</h3>
              <p className="text-xs text-amber-400 font-medium truncate">Управление платформой</p>
            </div>
          </div>

          <nav className="space-y-2">
            <div className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
              <span>Панель админа</span>
            </div>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800/80 mt-6">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 text-sm font-medium transition cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white">Администрирование школы</h1>
          <p className="text-slate-400 text-sm mt-1">Мониторинг пользователей, ролей и показателей</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Всего пользователей</p>
                <h3 className="text-4xl font-black text-white mt-2">{stats?.total_users || usersList.length || 0}</h3>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Учеников</p>
                <h3 className="text-4xl font-black text-cyan-400 mt-2">{stats?.students || 0}</h3>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Учителей</p>
                <h3 className="text-4xl font-black text-violet-400 mt-2">{stats?.teachers || 0}</h3>
              </div>
              <div className="p-3 bg-violet-500/10 rounded-2xl text-violet-400">
                <School className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Средняя продуктивность</p>
                <h3 className="text-4xl font-black text-emerald-400 mt-2">{stats?.school_avg_productivity || 88}%</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-white">Пользователи платформы</h3>
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по имени или email..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-950/40">
                    <th className="p-4 pl-6">Пользователь</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Школа</th>
                    <th className="p-4">Роль</th>
                    <th className="p-4 text-right pr-6">Изменить роль</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 pl-6 font-bold text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                          {u.name[0]}
                        </div>
                        {u.name}
                      </td>
                      <td className="p-4 text-slate-400">{u.email}</td>
                      <td className="p-4 text-slate-400">{u.school || '—'}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-bold ${
                            u.role === 'student'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              : u.role === 'teacher'
                              ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {u.role === 'student' ? 'Ученик' : u.role === 'teacher' ? 'Учитель' : 'Админ'}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs outline-none focus:border-amber-500"
                        >
                          <option value="student">Ученик</option>
                          <option value="teacher">Учитель</option>
                          <option value="admin">Админ</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
