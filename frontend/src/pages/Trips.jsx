import { useState, useEffect } from 'react';
import { trips as tripsApi, vehicles as vehiclesApi, drivers as driversApi } from '../api/client';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { SkeletonTable } from '../components/Skeleton';
import toast from 'react-hot-toast';

const statusSteps = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

export default function Trips() {
  const [list, setList] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({
    vehicle_id: '',
    driver_id: '',
    origin: '',
    destination: '',
    cargo_weight_kg: '',
    estimated_cost: '',
  });
  const [errors, setErrors] = useState({});

  async function load() {
    setLoading(true);
    try {
      const [tripsData, vehiclesData, driversData] = await Promise.all([
        tripsApi.list(statusFilter ? { status: statusFilter } : {}),
        vehiclesApi.available(),
        driversApi.available(),
      ]);
      setList(tripsData);
      setAvailableVehicles(vehiclesData);
      setAvailableDrivers(driversData);
    } catch (e) {
      toast.error(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  function openCreate() {
    setForm({
      vehicle_id: '',
      driver_id: '',
      origin: '',
      destination: '',
      cargo_weight_kg: '',
      estimated_cost: '',
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e = {};
    const vId = form.vehicle_id;
    const dId = form.driver_id;
    const vehicle = availableVehicles.find((v) => String(v.id) === String(vId));
    const driver = availableDrivers.find((d) => String(d.id) === String(dId));
    const cargo = Number(form.cargo_weight_kg);
    if (!form.origin.trim()) e.origin = 'Origin required';
    if (!form.destination.trim()) e.destination = 'Destination required';
    if (!vehicle) e.vehicle_id = 'Select an available vehicle';
    if (!driver) e.driver_id = 'Select an available driver';
    if (isNaN(cargo) || cargo <= 0) e.cargo_weight_kg = 'Valid cargo weight required';
    if (vehicle && cargo > vehicle.capacity_kg) e.cargo_weight_kg = `Exceeds vehicle capacity (${vehicle.capacity_kg} kg)`;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    try {
      await tripsApi.create({
        vehicle_id: Number(form.vehicle_id),
        driver_id: Number(form.driver_id),
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        cargo_weight_kg: Number(form.cargo_weight_kg),
        estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : undefined,
      });
      toast.success('Trip created');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.data?.error || err.message || 'Create failed');
      if (err.data?.error) setErrors({ submit: err.data.error });
    }
  }

  async function dispatchTrip(row) {
    try {
      await tripsApi.dispatch(row.id);
      toast.success('Trip dispatched');
      load();
    } catch (e) {
      toast.error(e.data?.error || e.message || 'Dispatch failed');
    }
  }

  async function completeTrip(row) {
    try {
      await tripsApi.complete(row.id);
      toast.success('Trip completed');
      load();
    } catch (e) {
      toast.error(e.data?.error || e.message || 'Complete failed');
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'vehicle_name', label: 'Vehicle' },
    { key: 'driver_name', label: 'Driver' },
    { key: 'origin', label: 'Origin' },
    { key: 'destination', label: 'Destination' },
    { key: 'cargo_weight_kg', label: 'Cargo (kg)' },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} /> },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.status === 'Draft' && (
            <Button size="sm" onClick={() => dispatchTrip(row)}>Dispatch</Button>
          )}
          {row.status === 'Dispatched' && (
            <Button size="sm" onClick={() => completeTrip(row)}>Complete</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trip Dispatcher</h1>
        <Button onClick={openCreate}>Create Trip</Button>
      </div>
      <Card>
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
          >
            <option value="">All statuses</option>
            {statusSteps.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <SkeletonTable rows={6} cols={8} />
        ) : (
          <Table columns={columns} data={list} keyField="id" emptyMessage="No trips" />
        )}
      </Card>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Trip"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Create</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{errors.submit}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vehicle (Available only)</label>
            <select
              value={form.vehicle_id}
              onChange={(e) => setForm((f) => ({ ...f, vehicle_id: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${errors.vehicle_id ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
              required
            >
              <option value="">Select vehicle</option>
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name} – {v.license_plate} ({v.capacity_kg} kg)</option>
              ))}
            </select>
            {errors.vehicle_id && <p className="text-xs text-red-500 mt-1">{errors.vehicle_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Driver (On Duty, valid license)</label>
            <select
              value={form.driver_id}
              onChange={(e) => setForm((f) => ({ ...f, driver_id: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${errors.driver_id ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
              required
            >
              <option value="">Select driver</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {errors.driver_id && <p className="text-xs text-red-500 mt-1">{errors.driver_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Origin</label>
            <input
              value={form.origin}
              onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${errors.origin ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
              required
            />
            {errors.origin && <p className="text-xs text-red-500 mt-1">{errors.origin}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Destination</label>
            <input
              value={form.destination}
              onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${errors.destination ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
              required
            />
            {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cargo Weight (kg)</label>
            <input
              type="number"
              min="1"
              value={form.cargo_weight_kg}
              onChange={(e) => setForm((f) => ({ ...f, cargo_weight_kg: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${errors.cargo_weight_kg ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
              required
            />
            {errors.cargo_weight_kg && <p className="text-xs text-red-500 mt-1">{errors.cargo_weight_kg}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estimated Cost (optional)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.estimated_cost}
              onChange={(e) => setForm((f) => ({ ...f, estimated_cost: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
