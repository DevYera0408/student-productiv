export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 ${className}`}
      {...props}
    />
  );
}
