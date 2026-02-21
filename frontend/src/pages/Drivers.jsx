import { useState, useEffect } from 'react';
import { drivers as driversApi } from '../api/client';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { SkeletonTable } from '../components/Skeleton';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Drivers() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState('');
  const [form, setForm] = useState({
    name: '',
    license_number: '',
    license_expiry: '',
    status: 'Off Duty',
  });

  async function load() {
    setLoading(true);
    try {
      const params = q ? { q } : {};
      const data = await driversApi.list(params);
      setList(data);
    } catch (e) {
      toast.error(e.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [q]);

  function openAdd() {
    setEditing(null);
    setForm({ name: '', license_number: '', license_expiry: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), status: 'Off Duty' });
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      name: row.name,
      license_number: row.license_number || '',
      license_expiry: row.license_expiry ? row.license_expiry.slice(0, 10) : '',
      status: row.status,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        name: form.name.trim(),
        license_number: form.license_number.trim() || undefined,
        license_expiry: form.license_expiry,
        status: form.status,
      };
      if (editing) {
        await driversApi.update(editing.id, payload);
        toast.success('Driver updated');
      } else {
        await driversApi.create(payload);
        toast.success('Driver added');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.data?.error || err.message || 'Save failed');
    }
  }

  async function setStatus(id, status) {
    try {
      await driversApi.update(id, { status });
      toast.success('Status updated');
      load();
    } catch (e) {
      toast.error(e.message || 'Update failed');
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'license_number', label: 'License #' },
    { key: 'license_expiry', label: 'License Expiry', render: (v) => v && format(new Date(v), 'PP') },
    { key: 'status', label: 'Status', render: (v, row) => (
      <span className="flex items-center gap-2">
        <Badge status={v} />
        {row.license_expired && <span className="text-xs text-red-600 dark:text-red-400 font-medium">Expired</span>}
      </span>
    ) },
    { key: 'completion_rate', label: 'Completion %', render: (v) => (v != null ? `${Number(v).toFixed(0)}%` : '–') },
    { key: 'safety_score', label: 'Safety Score', render: (v) => (v != null ? v : '–') },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>Edit</Button>
          {row.status !== 'On Duty' && !row.license_expired && (
            <Button size="sm" onClick={() => setStatus(row.id, 'On Duty')}>Set On Duty</Button>
          )}
          {row.status === 'On Duty' && (
            <Button size="sm" variant="secondary" onClick={() => setStatus(row.id, 'Off Duty')}>Set Off Duty</Button>
          )}
          {row.status !== 'Suspended' && (
            <Button size="sm" variant="danger" onClick={() => setStatus(row.id, 'Suspended')}>Suspend</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Driver Performance & Safety</h1>
        <Button onClick={openAdd}>Add Driver</Button>
      </div>
      <Card title="Drivers" subtitle="Assignment is blocked if license is expired. Use compliance warning (red) for expired licenses.">
        <div className="mb-4">
          <input
            type="search"
            placeholder="Search by name..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-64 text-sm"
          />
        </div>
        {loading ? (
          <SkeletonTable rows={6} cols={7} />
        ) : (
          <Table columns={columns} data={list} keyField="id" emptyMessage="No drivers" />
        )}
      </Card>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Driver' : 'Add Driver'}
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Number (optional)</label>
            <input
              value={form.license_number}
              onChange={(e) => setForm((f) => ({ ...f, license_number: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Expiry</label>
            <input
              type="date"
              value={form.license_expiry}
              onChange={(e) => setForm((f) => ({ ...f, license_expiry: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              required
            />
          </div>
          {editing && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="On Duty">On Duty</option>
                <option value="Off Duty">Off Duty</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
