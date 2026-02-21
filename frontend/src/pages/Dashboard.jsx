import { useState, useEffect } from 'react';
import { analytics, trips } from '../api/client';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Table from '../components/Table';
import { SkeletonCard, SkeletonTable } from '../components/Skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [fuelTrend, setFuelTrend] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [dash, trend, list] = await Promise.all([
          analytics.dashboard(),
          analytics.fuelTrend(),
          trips.list(),
        ]);
        if (!cancelled) {
          setKpis(dash);
          setFuelTrend(trend);
          setRecent(list.slice(0, 8));
        }
      } catch (e) {
        if (!cancelled) toast.error(e.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Command Center</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  const kpiCards = [
    { label: 'Active Fleet (On Trip)', value: kpis?.activeFleet ?? 0, sub: 'vehicles' },
    { label: 'Maintenance Alerts (In Shop)', value: kpis?.maintenanceAlerts ?? 0, sub: 'vehicles' },
    { label: 'Utilization Rate', value: `${kpis?.utilizationRate ?? 0}%`, sub: 'assigned' },
    { label: 'Pending Cargo', value: kpis?.pendingCargo ?? 0, sub: 'draft trips' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Command Center</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((k) => (
          <Card key={k.label} className="!p-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{k.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{k.value}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{k.sub}</p>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Fuel Trend" subtitle="Last 30 days">
          {fuelTrend.length ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fuelTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                    labelFormatter={(v) => format(new Date(v), 'PP')}
                  />
                  <Line type="monotone" dataKey="cost" name="Fuel cost" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">No fuel data yet</p>
          )}
        </Card>
        <Card title="Recent Activity" subtitle="Latest trips">
          <Table
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'origin', label: 'Origin' },
              { key: 'destination', label: 'Destination' },
              { key: 'status', label: 'Status', render: (v) => <Badge status={v} /> },
            ]}
            data={recent}
            keyField="id"
            emptyMessage="No trips yet"
          />
        </Card>
      </div>
    </div>
  );
}
