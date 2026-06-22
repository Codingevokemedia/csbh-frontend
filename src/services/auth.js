// Auth service — login/signup/logout with EVOKE Marketplace.
// PLACEHOLDER endpoints: map to real EVOKE auth API when available.

import { apiPost, apiGet, isMockMode } from './api.js';

const TOKEN_KEY    = 'kich.evoke.token';
const USER_KEY     = 'kich.evoke.user';
const EVOKE_SITE   = import.meta.env.VITE_EVOKE_SITE_URL || 'https://www.evokemarketplace.com';

export function saveSession(token, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {/* storage unavailable */}
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {/* ignore */}
}

export function getSession() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw   = localStorage.getItem(USER_KEY);
    if (!token || !raw) return null;
    return { token, user: JSON.parse(raw) };
  } catch {
    return null;
  }
}

// PLACEHOLDER endpoint: POST /auth/login
export async function login(email, password) {
  if (isMockMode()) {
    // Mock: accept any credentials for dev
    await new Promise(r => setTimeout(r, 800));
    const mockUser = {
      id: 'mock_user_001',
      email,
      firstName: 'Dev',
      lastName: 'User',
      avatar: null,
    };
    saveSession('mock_token_xyz', mockUser);
    return { token: 'mock_token_xyz', user: mockUser };
  }
  const data = await apiPost('/auth/login', { email, password });
  const { token, user } = data;
  saveSession(token, user);
  return { token, user };
}

// PLACEHOLDER endpoint: POST /auth/register
export async function signup(payload) {
  if (isMockMode()) {
    await new Promise(r => setTimeout(r, 1000));
    const mockUser = {
      id:        'mock_user_new',
      email:     payload.email,
      firstName: payload.firstName,
      lastName:  payload.lastName,
      avatar:    null,
    };
    saveSession('mock_token_new', mockUser);
    return { token: 'mock_token_new', user: mockUser };
  }
  const data = await apiPost('/auth/register', payload);
  const { token, user } = data;
  saveSession(token, user);
  return { token, user };
}

// PLACEHOLDER endpoint: POST /auth/logout
export async function logout() {
  if (!isMockMode()) {
    try { await apiPost('/auth/logout', {}); } catch {/* ignore network errors on logout */}
  }
  clearSession();
}

// PLACEHOLDER endpoint: GET /auth/me
export async function getMe() {
  if (isMockMode()) {
    const session = getSession();
    return session?.user || null;
  }
  try {
    const data = await apiGet('/auth/me');
    return data.user || data;
  } catch {
    clearSession();
    return null;
  }
}

// Redirect to EVOKE Marketplace sign-in (fallback for OAuth flow)
export function redirectToEvokeLogin(returnPath = '/') {
  const returnUrl = encodeURIComponent(window.location.origin + returnPath);
  window.location.href = `${EVOKE_SITE}/login?returnUrl=${returnUrl}`;
}
