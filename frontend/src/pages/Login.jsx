import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'student') navigate('/student');
      else if (user.role === 'teacher') navigate('/teacher');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoRole) => {
    if (demoRole === 'student') {
      setEmail('student@example.com');
      setPassword('password123');
    } else if (demoRole === 'teacher') {
      setEmail('teacher@example.com');
      setPassword('password123');
    } else if (demoRole === 'admin') {
      setEmail('admin@example.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow ambient background accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/70 border border-slate-800/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-cyan-500/20">
              S
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Student Productivity</span>
          </Link>
          <h1 className="text-3xl font-black text-white">Вход в систему</h1>
          <p className="text-slate-400 text-sm mt-2">Введите свои данные для доступа к платформе</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@school.edu"
              required
              className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full py-3.5 mt-2">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Вход...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Войти
              </span>
            )}
          </Button>
        </form>

        {/* Demo login shortcuts */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400 font-medium mb-3 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Быстрый демо-вход
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              className="px-2 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-xs font-medium text-cyan-400 transition"
            >
              Ученик
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('teacher')}
              className="px-2 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-xs font-medium text-violet-400 transition"
            >
              Учитель
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="px-2 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-xs font-medium text-amber-400 transition"
            >
              Админ
            </button>
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          Ещё нет аккаунта?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
