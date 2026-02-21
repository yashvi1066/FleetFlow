import { useState, useEffect } from 'react';
import { fuel as fuelApi, expenses as expensesApi, trips as tripsApi, vehicles as vehiclesApi, analytics } from '../api/client';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { SkeletonTable } from '../components/Skeleton';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Expenses() {
  const [fuelList, setFuelList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('fuel');
  const [modalOpen, setModalOpen] = useState(false);
  const [fuelForm, setFuelForm] = useState({
    trip_id: '',
    vehicle_id: '',
    liters: '',
    fuel_cost: '',
    log_date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [expenseForm, setExpenseForm] = useState({
    trip_id: '',
    vehicle_id: '',
    amount: '',
    category: '',
    description: '',
    expense_date: format(new Date(), 'yyyy-MM-dd'),
  });

  async function load() {
    setLoading(true);
    try {
      const [f, e, t, v, r] = await Promise.all([
        fuelApi.list(),
        expensesApi.list(),
        tripsApi.list({ status: 'Completed' }),
        vehiclesApi.list(),
        analytics.reports().catch(() => ({ topCostVehicles: [], fuelByVehicle: [] })),
      ]);
      setFuelList(f);
      setExpenseList(e);
      setTrips(t);
      setVehicles(v);
      setReports(r);
    } catch (err) {
      toast.error(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFuelSubmit(ev) {
    ev.preventDefault();
    try {
      await fuelApi.create({
        trip_id: fuelForm.trip_id ? Number(fuelForm.trip_id) : undefined,
        vehicle_id: Number(fuelForm.vehicle_id),
        liters: Number(fuelForm.liters),
        fuel_cost: Number(fuelForm.fuel_cost),
        log_date: fuelForm.log_date,
      });
      toast.success('Fuel log added');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.data?.error || err.message || 'Failed');
    }
  }

  async function handleExpenseSubmit(ev) {
    ev.preventDefault();
    try {
      await expensesApi.create({
        trip_id: expenseForm.trip_id ? Number(expenseForm.trip_id) : undefined,
        vehicle_id: expenseForm.vehicle_id ? Number(expenseForm.vehicle_id) : undefined,
        amount: Number(expenseForm.amount),
        category: expenseForm.category.trim() || undefined,
        description: expenseForm.description.trim() || undefined,
        expense_date: expenseForm.expense_date,
      });
      toast.success('Expense added');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.data?.error || err.message || 'Failed');
    }
  }

  const fuelColumns = [
    { key: 'id', label: 'ID' },
    { key: 'vehicle_name', label: 'Vehicle' },
    { key: 'liters', label: 'Liters' },
    { key: 'fuel_cost', label: 'Fuel Cost', render: (v) => (v != null ? `$${Number(v).toFixed(2)}` : '–') },
    { key: 'log_date', label: 'Date', render: (v) => v && format(new Date(v), 'PP') },
  ];

  const expenseColumns = [
    { key: 'id', label: 'ID' },
    { key: 'amount', label: 'Amount', render: (v) => (v != null ? `$${Number(v).toFixed(2)}` : '–') },
    { key: 'category', label: 'Category' },
    { key: 'description', label: 'Description' },
    { key: 'expense_date', label: 'Date', render: (v) => v && format(new Date(v), 'PP') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Expenses & Fuel</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              setTab('fuel');
              setFuelForm({ trip_id: '', vehicle_id: '', liters: '', fuel_cost: '', log_date: format(new Date(), 'yyyy-MM-dd') });
              setModalOpen(true);
            }}
          >
            Add Fuel Log
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setTab('expense');
              setExpenseForm({ trip_id: '', vehicle_id: '', amount: '', category: '', description: '', expense_date: format(new Date(), 'yyyy-MM-dd') });
              setModalOpen(true);
            }}
          >
            Add Expense
          </Button>
        </div>
      </div>
      {reports && reports.topCostVehicles?.length > 0 && (
        <Card title="Cost per Vehicle (Fuel + Maintenance)" className="!p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.topCostVehicles.slice(0, 6).map((v) => (
              <div key={v.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{v.name}</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                  ${(v.total_operational || 0).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total operational cost</p>
              </div>
            ))}
          </div>
        </Card>
      )}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setTab('fuel')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-smooth ${
            tab === 'fuel' ? 'bg-fleet-50 dark:bg-fleet-900/30 text-fleet-700 dark:text-fleet-300 border-b-2 border-fleet-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Fuel Logs
        </button>
        <button
          type="button"
          onClick={() => setTab('expense')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-smooth ${
            tab === 'expense' ? 'bg-fleet-50 dark:bg-fleet-900/30 text-fleet-700 dark:text-fleet-300 border-b-2 border-fleet-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Expenses
        </button>
      </div>
      {tab === 'fuel' && (
        <Card>
          <div className="mb-4">
            <Button size="sm" onClick={() => { setTab('fuel'); setModalOpen(true); setFuelForm({ trip_id: '', vehicle_id: '', liters: '', fuel_cost: '', log_date: format(new Date(), 'yyyy-MM-dd') }); }}>Add Fuel Log</Button>
          </div>
          {loading ? <SkeletonTable rows={5} cols={5} /> : <Table columns={fuelColumns} data={fuelList} keyField="id" emptyMessage="No fuel logs" />}
        </Card>
      )}
      {tab === 'expense' && (
        <Card>
          <div className="mb-4">
            <Button size="sm" onClick={() => { setTab('expense'); setModalOpen(true); setExpenseForm({ trip_id: '', vehicle_id: '', amount: '', category: '', description: '', expense_date: format(new Date(), 'yyyy-MM-dd') }); }}>Add Expense</Button>
          </div>
          {loading ? <SkeletonTable rows={5} cols={5} /> : <Table columns={expenseColumns} data={expenseList} keyField="id" emptyMessage="No expenses" />}
        </Card>
      )}
      {tab === 'fuel' && modalOpen && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Fuel Log" footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={handleFuelSubmit}>Save</Button></>}>
          <form onSubmit={handleFuelSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vehicle</label>
              <select value={fuelForm.vehicle_id} onChange={(e) => setFuelForm((f) => ({ ...f, vehicle_id: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" required>
                <option value="">Select</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Trip (optional)</label>
              <select value={fuelForm.trip_id} onChange={(e) => setFuelForm((f) => ({ ...f, trip_id: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                <option value="">None</option>
                {trips.map((t) => <option key={t.id} value={t.id}>#{t.id} {t.origin} → {t.destination}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Liters</label>
              <input type="number" min="0" step="0.01" value={fuelForm.liters} onChange={(e) => setFuelForm((f) => ({ ...f, liters: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fuel Cost</label>
              <input type="number" min="0" step="0.01" value={fuelForm.fuel_cost} onChange={(e) => setFuelForm((f) => ({ ...f, fuel_cost: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input type="date" value={fuelForm.log_date} onChange={(e) => setFuelForm((f) => ({ ...f, log_date: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" required />
            </div>
          </form>
        </Modal>
      )}
      {tab === 'expense' && modalOpen && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Expense" footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={handleExpenseSubmit}>Save</Button></>}>
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
              <input type="number" min="0" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input type="date" value={expenseForm.expense_date} onChange={(e) => setExpenseForm((f) => ({ ...f, expense_date: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category (optional)</label>
              <input value={expenseForm.category} onChange={(e) => setExpenseForm((f) => ({ ...f, category: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (optional)</label>
              <input value={expenseForm.description} onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
