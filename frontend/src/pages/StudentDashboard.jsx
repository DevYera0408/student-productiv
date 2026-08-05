export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <aside className="w-72 bg-slate-900 border-r border-slate-800 p-6">
        <h2 className="text-2xl font-bold text-cyan-400">
          Student
        </h2>

        <div className="mt-10 space-y-3">
          <button className="w-full text-left p-3 rounded-xl bg-slate-800">
            📊 Главная
          </button>

          <button className="w-full text-left p-3 rounded-xl hover:bg-slate-800">
            📝 Дневник
          </button>

          <button className="w-full text-left p-3 rounded-xl hover:bg-slate-800">
            🏆 Рейтинг
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold">
          Добро пожаловать
        </h1>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-slate-900 rounded-3xl p-6">
            <h3>Продуктивность</h3>
            <p className="text-5xl mt-4 font-bold text-cyan-400">
              92%
            </p>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6">
            <h3>Место в рейтинге</h3>
            <p className="text-5xl mt-4 font-bold text-yellow-400">
              #3
            </p>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6">
            <h3>Баллы</h3>
            <p className="text-5xl mt-4 font-bold text-green-400">
              1240
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
