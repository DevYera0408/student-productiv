export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-slate-700/80 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
