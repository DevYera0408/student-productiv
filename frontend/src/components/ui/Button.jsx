export function Button({ children, className = "", variant = "primary", size = "md", ...props }) {
  const base = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer";

  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 active:scale-[0.98]",
    secondary: "bg-slate-800 text-white hover:bg-slate-700 active:scale-[0.98]",
    outline: "border border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600 active:scale-[0.98]",
    ghost: "text-slate-300 hover:bg-slate-800/80 hover:text-white",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5",
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} {...props}>
      {children}
    </button>
  );
}
