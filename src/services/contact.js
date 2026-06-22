import { apiPost } from './api.js';

/**
 * Submits the CS Beverly Hills "Contact Us" form.
 *
 * Reuses the shared marketplace contact endpoint (the same one Kich uses):
 *   POST /api/kich-contact   { name, email, message, source }   (public, no auth)
 *
 * `source: 'csbh'` tells the backend to route the notification email to
 * Support@craigshelly.com and brand it as CS Beverly Hills.
 */
export async function submitContactEnquiry({ name, email, message }) {
  return apiPost('/kich-contact', { name, email, message, source: 'csbh' });
}
