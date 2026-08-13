import { apiGet } from './api.js';

// CS Beverly Hills home page template — saved by the admin builder and stored
// server-side (HomeTemplate row, WebsiteCode "CSBH") via the generic
// getHomeTemplate / saveHomeTemplate API.
//
// Returns the saved content object, or null when nothing has been customised
// yet (or the backend is unreachable) so the homepage falls back to its
// built-in defaults.
export async function getHomeTemplate() {
  try {
    const res = await apiGet('/home-template/home/CSBH');
    const tpl = res?.data?.templateData;
    return tpl && typeof tpl === 'object' ? tpl : null;
  } catch {
    return null;
  }
}
