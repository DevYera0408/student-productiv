import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-7xl font-bold text-red-500">404</h1>

      <p className="mt-4 text-xl">
        Страница не найдена
      </p>

      <Link
        to="/"
        className="mt-8 rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-900 hover:bg-cyan-400 transition"
      >
        Вернуться на главную
      </Link>
    </div>
  );
}
