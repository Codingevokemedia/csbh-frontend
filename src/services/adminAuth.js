// Admin auth for the CSBH admin pages — backed by the REAL Evoke auth system.
// Sign-in goes through /api/auth/signin, which returns a JWT (stored for the
// Authorization header) and sets an httpOnly auth_token cookie. Admin access
// requires an Evoke account with UserRoleID 1 (SuperAdmin) or 2 (Admin) — the
// backend's requireAdmin middleware enforces this on every write request, so
// this client state is only for routing/UX, not the actual security boundary.
import { apiPost } from './api.js';

const TOKEN_KEY   = 'kich.evoke.token';   // read by api.js → Authorization: Bearer
const SESSION_KEY = 'csbh.admin.session'; // lightweight UX flag
const ADMIN_ROLE_IDS = [1, 2];

export function isAdminAuthed() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

// Authenticate against Evoke. Resolves on success; throws Error with a friendly
// message on bad credentials / non-admin / 2FA.
export async function adminLogin(email, password) {
  const res = await apiPost('/auth/signin', { EmailID: email, Password: password });
  const data = res?.data ?? res ?? {};

  // 2FA-enabled accounts return a pendingToken instead of a session token.
  if (data.pendingToken || data.requiresTwoFactor) {
    throw new Error('This account requires two-factor sign-in, which is not supported here.');
  }
  // Invalid credentials come back as a success envelope with no token.
  if (!data.token) {
    throw new Error('Invalid email or password.');
  }
  // Authorisation: must be an admin role.
  if (!ADMIN_ROLE_IDS.includes(Number(data.role))) {
    throw new Error('This account does not have admin access.');
  }

  try {
    localStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch { /* ignore storage errors */ }
  return data;
}

export async function adminLogout() {
  try { await apiPost('/auth/signout', {}); } catch { /* best effort */ }
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}
