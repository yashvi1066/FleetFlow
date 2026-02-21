const statusStyles = {
  Available: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300',
  'On Trip': 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
  Suspended: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
  'In Shop': 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300',
  'Out of Service': 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
  Draft: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  Dispatched: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
  Completed: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300',
  Cancelled: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
  'On Duty': 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300',
  'Off Duty': 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  Scheduled: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  'In Progress': 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300',
};

export default function Badge({ status, label, className = '' }) {
  const style = statusStyles[status || label] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style} ${className}`}>
      {label ?? status}
    </span>
  );
}
