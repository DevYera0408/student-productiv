import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, User } from 'lucide-react';
import { Button } from '../ui/Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'student') return '/student';
    if (user.role === 'teacher') return '/teacher';
    if (user.role === 'admin') return '/admin';
    return '/';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 font-black text-slate-950 shadow-md shadow-cyan-500/20 transition group-hover:scale-105">
            S
          </div>
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-400 transition">
            Student Productivity
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <Link to="/" className="hover:text-white transition">Главная</Link>
          <a href="#features" className="hover:text-white transition">Возможности</a>
          <a href="#preview" className="hover:text-white transition">Дашборд</a>
          <a href="#testimonials" className="hover:text-white transition">Отзывы</a>
          <a href="#faq" className="hover:text-white transition">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to={getDashboardPath()}>
                <Button variant="primary" size="sm">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Кабинет ({user.role === 'student' ? 'Ученик' : user.role === 'teacher' ? 'Учитель' : 'Админ'})</span>
                </Button>
              </Link>
              <button
                onClick={handleLogout}
                title="Выйти"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-xl border border-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Войти</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Начать бесплатно</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
