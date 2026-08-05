import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCheck, GraduationCap, School, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Register() {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('');
  const [city, setCity] = useState('');
  const [classNum, setClassNum] = useState('10');
  const [classLetter, setClassLetter] = useState('A');
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        role,
        name,
        email,
        password,
        school,
        city,
        class_num: role === 'student' ? classNum : undefined,
        class_letter: role === 'student' ? classLetter : undefined,
        subject: role === 'teacher' ? subject : undefined,
      };

      const user = await register(payload);
      if (user.role === 'student') navigate('/student');
      else if (user.role === 'teacher') navigate('/teacher');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при регистрации. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl relative z-10 my-8">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-cyan-500/20">
              S
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Student Productivity</span>
          </Link>
          <h1 className="text-3xl font-black text-white">Регистрация</h1>
          <p className="text-slate-400 text-sm mt-1">Выберите роль и заполните профиль</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
              role === 'student'
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 font-bold'
                : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
            }`}
          >
            <GraduationCap className="w-6 h-6" />
            <span className="text-sm">Ученик</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
              role === 'teacher'
                ? 'border-violet-500 bg-violet-500/10 text-violet-400 font-bold'
                : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
            }`}
          >
            <School className="w-6 h-6" />
            <span className="text-sm">Учитель</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
              role === 'admin'
                ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-bold'
                : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-6 h-6" />
            <span className="text-sm">Админ</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">ФИО / Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ералы Сериков"
                required
                className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="eraly@school.edu"
                required
                className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>
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

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Школа / Лицей</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="НИШ ФМН"
                className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Город</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Алматы"
                className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>
          </div>

          {role === 'student' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Класс</label>
                <select
                  value={classNum}
                  onChange={(e) => setClassNum(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
                >
                  {['7', '8', '9', '10', '11', '12'].map((num) => (
                    <option key={num} value={num}>{num} класс</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Буква</label>
                <input
                  type="text"
                  value={classLetter}
                  onChange={(e) => setClassLetter(e.target.value.toUpperCase())}
                  placeholder="A"
                  maxLength={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {role === 'teacher' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Предмет</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Математика / Информатика"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full py-3.5 mt-4">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Создаем аккаунт...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Зарегистрироваться
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline font-semibold">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
