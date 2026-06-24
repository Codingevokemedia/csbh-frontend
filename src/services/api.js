






// Base API client — all EVOKE Marketplace HTTP calls go through here.
// Set VITE_EVOKE_API_BASE in .env to activate real API mode.

// Defensive URL normalizer — strips trailing slashes and accidental leading
// dots in the hostname from a misconfigured env var.
function cleanUrl(raw) {
  if (!raw) return raw;
  return String(raw)
    .replace(/\/+$/, '')
    .replace(/^(https?:\/\/)\.+/i, '$1');
}

// Defaults to the shared EVOKE backend (same one the Kich storefront uses) so
// the app talks to real data out of the box. Override with VITE_EVOKE_API_BASE.
const BASE_URL = cleanUrl(
  import.meta.env.VITE_EVOKE_API_BASE || 'http://localhost:3000/api',
);
const API_KEY  = import.meta.env.VITE_EVOKE_API_KEY  || '';
const TOKEN_KEY = 'kich.evoke.token';

// Only fall into offline/mock mode if the base URL is explicitly blanked out.
const IS_MOCK_MODE = !BASE_URL;

function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

function buildHeaders(extra = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...extra,
  };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (API_KEY) headers['x-api-key'] = API_KEY;
  return headers;
}

async function handleResponse(res) {
  if (res.status === 401) {
    // Session expired — clear local token
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new CustomEvent('evoke:session-expired'));
    throw new Error('Session expired. Please sign in again.');
  }
  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const data = await res.json();
      message = data.message || data.error || message;
    } catch {/* ignore parse errors */}
    throw new Error(message);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export function isMockMode() {
  return IS_MOCK_MODE;
}

export async function apiGet(path, options = {}) {
  if (IS_MOCK_MODE) throw new Error('MOCK_MODE');
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: buildHeaders(options.headers),
    credentials: 'include',
    signal: options.signal,
  });
  return handleResponse(res);
}

export async function apiPost(path, body = {}, options = {}) {
  if (IS_MOCK_MODE) throw new Error('MOCK_MODE');
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(options.headers),
    credentials: 'include',
    body: JSON.stringify(body),
    signal: options.signal,
  });
  return handleResponse(res);
}

export async function apiPut(path, body = {}, options = {}) {
  if (IS_MOCK_MODE) throw new Error('MOCK_MODE');
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: buildHeaders(options.headers),
    credentials: 'include',
    body: JSON.stringify(body),
    signal: options.signal,
  });
  return handleResponse(res);
}

export async function apiDelete(path, options = {}) {
  if (IS_MOCK_MODE) throw new Error('MOCK_MODE');
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(options.headers),
    credentials: 'include',
    signal: options.signal,
  });
  return handleResponse(res);
}
