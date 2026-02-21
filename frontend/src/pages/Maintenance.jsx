import { useState, useEffect } from 'react';
import { maintenance as maintenanceApi, vehicles as vehiclesApi } from '../api/client';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { SkeletonTable } from '../components/Skeleton';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Maintenance() {
  const [list, setList] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    vehicle_id: '',
    service_type: '',
    cost: '',
    log_date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });

  async function load() {
    setLoading(true);
    try {
      const [logs, v] = await Promise.all([maintenanceApi.list(), vehiclesApi.list()]);
      setList(logs);
      setVehicles(v);
    } catch (e) {
      toast.error(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setForm({
      vehicle_id: '',
      service_type: '',
      cost: '',
      log_date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await maintenanceApi.create({
        vehicle_id: Number(form.vehicle_id),
        service_type: form.service_type.trim(),
        cost: Number(form.cost),
        log_date: form.log_date,
        notes: form.notes.trim() || undefined,
      });
      toast.success('Maintenance log created – vehicle set to In Shop');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.data?.error || err.message || 'Create failed');
    }
  }

  async function completeLog(row) {
    try {
      await maintenanceApi.complete(row.id);
      toast.success('Service completed – vehicle back to Available if no other logs');
      load();
    } catch (e) {
      toast.error(e.message || 'Update failed');
    }
  }

  const columns = [
    { key: 'id', label: 'Log ID' },
    { key: 'vehicle_name', label: 'Vehicle' },
    { key: 'service_type', label: 'Service Type' },
    { key: 'cost', label: 'Cost', render: (v) => (v != null ? `$${Number(v).toFixed(2)}` : '–') },
    { key: 'log_date', label: 'Date', render: (v) => v && format(new Date(v), 'PP') },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} /> },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) =>
        row.status !== 'Completed' ? (
          <Button size="sm" onClick={() => completeLog(row)}>Mark Complete</Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance & Service Logs</h1>
        <Button onClick={openAdd}>Add Service Log</Button>
      </div>
      <Card title="Service Logs" subtitle="Creating a log sets vehicle to In Shop. Completing all logs returns vehicle to Available.">
        {loading ? (
          <SkeletonTable rows={6} cols={7} />
        ) : (
          <Table columns={columns} data={list} keyField="id" emptyMessage="No maintenance logs" />
        )}
      </Card>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Maintenance Log"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Create</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vehicle</label>
            <select
              value={form.vehicle_id}
              onChange={(e) => setForm((f) => ({ ...f, vehicle_id: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              required
            >
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name} – {v.license_plate}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Service Type</label>
            <input
              value={form.service_type}
              onChange={(e) => setForm((f) => ({ ...f, service_type: e.target.value }))}
              placeholder="e.g. Oil change, Brake check"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cost</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.cost}
              onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
            <input
              type="date"
              value={form.log_date}
              onChange={(e) => setForm((f) => ({ ...f, log_date: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
