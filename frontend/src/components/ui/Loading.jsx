export function Loading({ message = "Загрузка данных..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin" />
        <div className="absolute w-6 h-6 border-4 border-slate-800 border-b-blue-500 rounded-full animate-spin [animation-direction:reverse]" />
      </div>
      <p className="text-sm font-medium text-slate-400 animate-pulse">{message}</p>
    </div>
  );
}

export default Loading;
