/**
 * Thin API client for GlobeTrotter backend.
 * Automatically attaches the JWT, handles 401 token refresh, and re-tries once.
 */

const BASE = 'http://localhost:5000/api';

// ── token helpers ─────────────────────────────────────────────
export const getAccessToken  = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');

export function saveTokens({ access_token, refresh_token }) {
  localStorage.setItem('access_token',  access_token);
  localStorage.setItem('refresh_token', refresh_token);
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}

export function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function loadUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

// ── core fetch ────────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue = [];   // callbacks waiting for new token

function drainQueue(token) {
  refreshQueue.forEach(cb => cb(token));
  refreshQueue = [];
}

// Auth routes should never trigger the token-refresh retry loop
const NO_RETRY_PATHS = ['/auth/login', '/auth/signup', '/auth/refresh', '/auth/logout'];

async function _fetch(path, options = {}, retry = true) {
  const token = getAccessToken();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // Don't set Content-Type when FormData (browser sets boundary automatically)
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  // Handle 401 — try refresh once, but never on auth routes themselves
  if (res.status === 401 && retry && !NO_RETRY_PATHS.includes(path)) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) { clearTokens(); throw new ApiError(401, 'Session expired. Please log in again.'); }

    if (isRefreshing) {
      // Queue this request until refresh completes
      return new Promise((resolve, reject) => {
        refreshQueue.push(async (newToken) => {
          try {
            resolve(await _fetch(path, options, false));
          } catch (e) { reject(e); }
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${BASE}/auth/refresh`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!refreshRes.ok) { clearTokens(); throw new ApiError(401, 'Session expired. Please log in again.'); }
      const tokens = await refreshRes.json();
      saveTokens(tokens);
      drainQueue(tokens.access_token);
      return await _fetch(path, options, false);
    } finally {
      isRefreshing = false;
    }
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try { const body = await res.json(); message = body.error || body.message || message; } catch {}
    throw new ApiError(res.status, message);
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// ── convenience methods ───────────────────────────────────────
export const api = {
  get:    (path)         => _fetch(path, { method: 'GET' }),
  post:   (path, body)   => _fetch(path, { method: 'POST',   body: body instanceof FormData ? body : JSON.stringify(body) }),
  put:    (path, body)   => _fetch(path, { method: 'PUT',    body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch:  (path, body)   => _fetch(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)         => _fetch(path, { method: 'DELETE' }),
};

// ── dashboard ─────────────────────────────────────────────────
export const dashboardApi = {
  landing: () => api.get('/dashboard/landing'),
  destinations: (params = {}) =>
    api.get('/dashboard/destinations?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined))
    )),
};

// ── auth ──────────────────────────────────────────────────────
export const authApi = {
  login:   (email, password)                        => api.post('/auth/login',  { email, password }),
  signup:  (data)                                   => api.post('/auth/signup', data),
  logout:  ()                                       => api.post('/auth/logout', { refresh_token: getRefreshToken() }),
  me:      ()                                       => api.get('/auth/me'),
};

// ── users ─────────────────────────────────────────────────────
export const usersApi = {
  getMe:      ()     => api.get('/users/me'),
  updateMe:   (data) => api.put('/users/me', data),
  uploadAvatar: (file) => {
    const fd = new FormData(); fd.append('avatar', file);
    return _fetch('/users/me/avatar', { method: 'POST', body: fd });
  },
};

// ── trips ─────────────────────────────────────────────────────
export const tripsApi = {
  list:          (params = {}) => api.get('/trips?' + new URLSearchParams(params)),
  create:        (data)        => api.post('/trips', data),
  get:           (id)          => api.get(`/trips/${id}`),
  update:        (id, data)    => api.put(`/trips/${id}`, data),
  delete:        (id)          => api.delete(`/trips/${id}`),
  getPublic:     (id)          => api.get(`/trips/${id}/public`),
  recordView:    (id)          => api.post(`/trips/${id}/view`, {}),
  copy:          (id)          => api.post(`/trips/${id}/copy`, {}),
  saveToMyTrips: (id)          => api.post(`/trips/${id}/save-to-my-trips`, {}),
  fromTemplate:  (tmplId, data)=> api.post(`/trips/from-template/${tmplId}`, data),
  calendar:      (month, year) => api.get(`/trips/calendar?month=${month}&year=${year}`),
};

// ── stops ─────────────────────────────────────────────────────
export const stopsApi = {
  list:    (tripId)           => api.get(`/trips/${tripId}/stops`),
  create:  (tripId, data)     => api.post(`/trips/${tripId}/stops`, data),
  update:  (tripId, id, data) => api.put(`/trips/${tripId}/stops/${id}`, data),
  delete:  (tripId, id)       => api.delete(`/trips/${tripId}/stops/${id}`),
  reorder: (tripId, ids)      => api.patch(`/trips/${tripId}/stops/reorder`, { ids }),
};

// ── activities ────────────────────────────────────────────────
export const activitiesApi = {
  list:    (tripId, stopId)          => api.get(`/trips/${tripId}/stops/${stopId}/activities`),
  create:  (tripId, stopId, data)    => api.post(`/trips/${tripId}/stops/${stopId}/activities`, data),
  update:  (tripId, stopId, id, data)=> api.put(`/trips/${tripId}/stops/${stopId}/activities/${id}`, data),
  delete:  (tripId, stopId, id)      => api.delete(`/trips/${tripId}/stops/${stopId}/activities/${id}`),
  reorder: (tripId, stopId, ids)     => api.patch(`/trips/${tripId}/stops/${stopId}/activities/reorder`, { ids }),
};

// ── budget & expenses ─────────────────────────────────────────
export const budgetApi = {
  get:     (tripId)      => api.get(`/trips/${tripId}/budget`),
  update:  (tripId, data)=> api.put(`/trips/${tripId}/budget`, data),
  summary: (tripId)      => api.get(`/trips/${tripId}/budget/summary`),
};

export const expensesApi = {
  list:   (tripId, params = {}) => api.get(`/trips/${tripId}/expenses?` + new URLSearchParams(params)),
  create: (tripId, data)        => api.post(`/trips/${tripId}/expenses`, data),
  update: (tripId, id, data)    => api.put(`/trips/${tripId}/expenses/${id}`, data),
  delete: (tripId, id)          => api.delete(`/trips/${tripId}/expenses/${id}`),
};

// ── cities ────────────────────────────────────────────────────
export const citiesApi = {
  list:        (params = {}) => api.get('/cities?' + new URLSearchParams(params)),
  featured:    ()            => api.get('/cities/featured'),
  recommended: ()            => api.get('/cities/recommended'),
  suggestions: (cityName)    => api.get(`/cities/${encodeURIComponent(cityName)}/suggestions`),
};

// ── templates ─────────────────────────────────────────────────
export const templatesApi = {
  list: (category) => api.get('/trip-templates' + (category ? `?category=${category}` : '')),
  get:  (id)       => api.get(`/trip-templates/${id}`),
};

// ── community ─────────────────────────────────────────────────
export const communityApi = {
  posts:       (params = {}) => api.get('/community/posts?' + new URLSearchParams(params)),
  getPost:     (id)          => api.get(`/community/posts/${id}`),
  createPost:  (data)        => api.post('/community/posts', data),
  updatePost:  (id, data)    => api.put(`/community/posts/${id}`, data),
  deletePost:  (id)          => api.delete(`/community/posts/${id}`),
  like:        (id)          => api.post(`/community/posts/${id}/like`, {}),
  unlike:      (id)          => api.delete(`/community/posts/${id}/like`),
  save:        (id)          => api.post(`/community/posts/${id}/save`, {}),
  unsave:      (id)          => api.delete(`/community/posts/${id}/save`),
  trending:    ()            => api.get('/community/trending-destinations'),
  topContribs: ()            => api.get('/community/top-contributors'),
};

// ── admin ─────────────────────────────────────────────────────
export const adminApi = {
  stats:        ()           => api.get('/admin/stats'),
  userGrowth:   (year)       => api.get(`/admin/stats/user-growth?year=${year}`),
  topDests:     ()           => api.get('/admin/destinations/top'),
  users:        (params = {})=> api.get('/admin/users?' + new URLSearchParams(params)),
  updateUser:   (id, data)   => api.put(`/admin/users/${id}`, data),
  deleteUser:   (id)         => api.delete(`/admin/users/${id}`),
};

// ── uploads ───────────────────────────────────────────────────
export const uploadsApi = {
  coverImage: (file) => {
    const fd = new FormData(); fd.append('cover', file);
    return _fetch('/uploads/cover-image', { method: 'POST', body: fd });
  },
  postImage: (file) => {
    const fd = new FormData(); fd.append('image', file);
    return _fetch('/uploads/post-image', { method: 'POST', body: fd });
  },
};
