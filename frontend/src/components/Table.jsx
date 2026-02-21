export default function Table({ columns, data, keyField = 'id', emptyMessage = 'No data' }) {
  return (
    <div className="overflow-x-auto rounded-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row[keyField]} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-smooth">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
