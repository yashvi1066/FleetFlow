const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('fleetflow_token');
}

export async function api(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  const data = res.ok ? (res.status === 204 ? null : await res.json()) : await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const auth = {
  login: (email, password) => api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
};

export const vehicles = {
  list: (params) => api('/vehicles?' + new URLSearchParams(params || {}).toString()),
  available: () => api('/vehicles/available'),
  get: (id) => api(`/vehicles/${id}`),
  create: (body) => api('/vehicles', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => api(`/vehicles/${id}`, { method: 'DELETE' }),
};

export const drivers = {
  list: (params) => api('/drivers?' + new URLSearchParams(params || {}).toString()),
  available: () => api('/drivers/available'),
  get: (id) => api(`/drivers/${id}`),
  create: (body) => api('/drivers', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/drivers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => api(`/drivers/${id}`, { method: 'DELETE' }),
};

export const trips = {
  list: (params) => api('/trips?' + new URLSearchParams(params || {}).toString()),
  get: (id) => api(`/trips/${id}`),
  create: (body) => api('/trips', { method: 'POST', body: JSON.stringify(body) }),
  dispatch: (id) => api(`/trips/${id}/dispatch`, { method: 'PATCH' }),
  complete: (id) => api(`/trips/${id}/complete`, { method: 'PATCH' }),
  update: (id, body) => api(`/trips/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
};

export const maintenance = {
  list: (params) => api('/maintenance?' + new URLSearchParams(params || {}).toString()),
  create: (body) => api('/maintenance', { method: 'POST', body: JSON.stringify(body) }),
  complete: (id) => api(`/maintenance/${id}/complete`, { method: 'PATCH' }),
};

export const fuel = {
  list: (params) => api('/fuel?' + new URLSearchParams(params || {}).toString()),
  create: (body) => api('/fuel', { method: 'POST', body: JSON.stringify(body) }),
};

export const expenses = {
  list: (params) => api('/expenses?' + new URLSearchParams(params || {}).toString()),
  create: (body) => api('/expenses', { method: 'POST', body: JSON.stringify(body) }),
};

export const analytics = {
  dashboard: () => api('/analytics/dashboard'),
  fuelTrend: () => api('/analytics/fuel-trend'),
  reports: () => api('/analytics/reports'),
};
