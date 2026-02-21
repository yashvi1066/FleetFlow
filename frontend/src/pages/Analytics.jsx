import { useState, useEffect } from 'react';
import { analytics as analyticsApi } from '../api/client';
import Card from '../components/Card';
import Button from '../components/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function downloadCSV(data, filename) {
  if (!data?.length) return;
  const headers = Object.keys(data[0]).filter((k) => typeof data[0][k] !== 'object');
  const csv = [headers.join(','), ...data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPDF() {
  window.print();
}

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null);
  const [fuelTrend, setFuelTrend] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [dash, trend, rep] = await Promise.all([
          analyticsApi.dashboard(),
          analyticsApi.fuelTrend(),
          analyticsApi.reports(),
        ]);
        if (!cancelled) {
          setDashboard(dash);
          setFuelTrend(trend);
          setReports(rep);
        }
      } catch (e) {
        if (!cancelled) toast.error(e.message || 'Failed to load analytics');
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Operational Analytics</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 skeleton rounded-card" />
          <div className="h-64 skeleton rounded-card" />
        </div>
      </div>
    );
  }

  const topCost = reports?.topCostVehicles || [];
  const fuelByVehicle = reports?.fuelByVehicle || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Operational Analytics & Reports</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (topCost.length) {
                downloadCSV(topCost.map((v) => ({ name: v.name, license_plate: v.license_plate, total_operational: v.total_operational })), 'fleetflow-costs.csv');
                toast.success('CSV downloaded');
              } else toast.error('No data to export');
            }}
          >
            Export CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={downloadPDF}>
            Print / PDF
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Utilization %</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{dashboard?.utilizationRate ?? 0}%</p>
        </Card>
        <Card className="!p-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Fleet</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{dashboard?.activeFleet ?? 0}</p>
        </Card>
        <Card className="!p-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">In Shop</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{dashboard?.maintenanceAlerts ?? 0}</p>
        </Card>
        <Card className="!p-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Cargo</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{dashboard?.pendingCargo ?? 0}</p>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Fuel Efficiency / Cost Trend" subtitle="Fuel cost over time">
          {fuelTrend.length ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fuelTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" tickFormatter={(v) => format(new Date(v), 'MMM d')} />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: 8 }} labelFormatter={(v) => format(new Date(v), 'PP')} />
                  <Line type="monotone" dataKey="cost" name="Fuel cost" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">No fuel data yet</p>
          )}
        </Card>
        <Card title="Top 5 Cost Vehicles" subtitle="Fuel + Maintenance total">
          {topCost.length ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCost.slice(0, 5)} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#64748b" tickFormatter={(v) => `$${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" width={70} />
                  <Tooltip contentStyle={{ borderRadius: 8 }} formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Total cost']} />
                  <Bar dataKey="total_operational" fill="#2563eb" name="Total cost" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">No cost data yet</p>
          )}
        </Card>
      </div>
    </div>
  );
}
