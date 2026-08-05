import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 py-12">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 font-black text-slate-950 text-sm">
              S
            </div>
            <span className="text-base font-bold text-white">Student Productivity</span>
          </div>
          <p className="text-sm text-slate-500">
            Современный инструмент отслеживания учебных успехов, посещаемости и ежедневной продуктивности студентов.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Навигация</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-cyan-400 transition">Главная</Link></li>
            <li><a href="#features" className="hover:text-cyan-400 transition">Функционал</a></li>
            <li><a href="#preview" className="hover:text-cyan-400 transition">Дашборд</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Для пользователей</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-cyan-400 transition">Вход ученика</Link></li>
            <li><Link to="/login" className="hover:text-cyan-400 transition">Кабинет учителя</Link></li>
            <li><Link to="/register" className="hover:text-cyan-400 transition">Регистрация школы</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Платформа</h4>
          <p className="text-sm text-slate-500 mb-2">Версия 2.0 Production Commercial Edition</p>
          <span className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full text-xs font-semibold">
            Status: Active Online
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 mt-12 pt-6 border-t border-slate-900 text-xs text-slate-600 text-center">
        © {new Date().getFullYear()} Student Productivity Platform. Все права защищены.
      </div>
    </footer>
  );
}
