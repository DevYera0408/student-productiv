export default function Register() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <h1 className="text-3xl font-bold text-white">
          Регистрация
        </h1>

        <div className="mt-6 space-y-4">
          <input
            placeholder="ФИО"
            className="w-full bg-slate-800 rounded-xl px-4 py-3 text-white"
          />

          <input
            placeholder="Email"
            className="w-full bg-slate-800 rounded-xl px-4 py-3 text-white"
          />

          <input
            type="password"
            placeholder="Пароль"
            className="w-full bg-slate-800 rounded-xl px-4 py-3 text-white"
          />

          <button className="w-full py-3 bg-cyan-500 rounded-xl text-black font-bold">
            Создать аккаунт
          </button>
        </div>
      </div>
    </div>
  );
}
