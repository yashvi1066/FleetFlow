import { useState, useEffect } from 'react';
import { vehicles as vehiclesApi } from '../api/client';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { SkeletonTable } from '../components/Skeleton';
import toast from 'react-hot-toast';

export default function Vehicles() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({
    name: '',
    model: '',
    license_plate: '',
    capacity_kg: '',
    odometer: '',
    out_of_service: false,
  });

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (statusFilter) params.status = statusFilter;
      const data = await vehiclesApi.list(params);
      setList(data);
    } catch (e) {
      toast.error(e.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [q, statusFilter]);

  function openAdd() {
    setEditing(null);
    setForm({ name: '', model: '', license_plate: '', capacity_kg: '', odometer: '', out_of_service: false });
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      name: row.name,
      model: row.model,
      license_plate: row.license_plate,
      capacity_kg: String(row.capacity_kg),
      odometer: String(row.odometer || 0),
      out_of_service: !!row.out_of_service,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        name: form.name.trim(),
        model: form.model.trim(),
        license_plate: form.license_plate.trim(),
        capacity_kg: Number(form.capacity_kg) || 0,
        odometer: Number(form.odometer) || 0,
        out_of_service: form.out_of_service,
      };
      if (editing) {
        await vehiclesApi.update(editing.id, payload);
        toast.success('Vehicle updated');
      } else {
        await vehiclesApi.create(payload);
        toast.success('Vehicle added');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.data?.error || err.message || 'Save failed');
    }
  }

  async function handleDelete(row) {
    if (!window.confirm(`Delete vehicle "${row.name}"?`)) return;
    try {
      await vehiclesApi.delete(row.id);
      toast.success('Vehicle deleted');
      load();
    } catch (e) {
      toast.error(e.data?.error || e.message || 'Delete failed');
    }
  }

  async function toggleOutOfService(row) {
    try {
      await vehiclesApi.update(row.id, { out_of_service: !row.out_of_service });
      toast.success(row.out_of_service ? 'Vehicle back in service' : 'Vehicle set out of service');
      load();
    } catch (e) {
      toast.error(e.message || 'Update failed');
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'model', label: 'Model' },
    { key: 'license_plate', label: 'License Plate' },
    { key: 'capacity_kg', label: 'Capacity (kg)', render: (v) => `${v} kg` },
    { key: 'odometer', label: 'Odometer' },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} /> },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => toggleOutOfService(row)}>
            {row.out_of_service ? 'In Service' : 'Out of Service'}
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vehicle Registry</h1>
        <Button onClick={openAdd}>Add Vehicle</Button>
      </div>
      <Card>
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="search"
            placeholder="Search name, model, plate..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-64 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
          >
            <option value="">All statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Out of Service">Out of Service</option>
          </select>
        </div>
        {loading ? (
          <SkeletonTable rows={6} cols={7} />
        ) : (
          <Table columns={columns} data={list} keyField="id" emptyMessage="No vehicles" />
        )}
      </Card>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Vehicle' : 'Add Vehicle'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model</label>
            <input
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Plate (unique)</label>
            <input
              value={form.license_plate}
              onChange={(e) => setForm((f) => ({ ...f, license_plate: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Capacity (kg)</label>
            <input
              type="number"
              min="1"
              value={form.capacity_kg}
              onChange={(e) => setForm((f) => ({ ...f, capacity_kg: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Odometer</label>
            <input
              type="number"
              min="0"
              value={form.odometer}
              onChange={(e) => setForm((f) => ({ ...f, odometer: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.out_of_service}
              onChange={(e) => setForm((f) => ({ ...f, out_of_service: e.target.checked }))}
              className="rounded border-slate-300 text-fleet-600 focus:ring-fleet-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Out of Service</span>
          </label>
        </form>
      </Modal>
    </div>
  );
}
