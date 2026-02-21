export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled, ...props }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-smooth focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fleet-500 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-fleet-600 text-white hover:bg-fleet-700 dark:bg-fleet-500 dark:hover:bg-fleet-600 shadow-sm',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };
  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
