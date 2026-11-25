// Same rules as the Evoke marketplace product page (evoke_frontend/lib/certificateUtils.js).
const EXCLUDED_ATTRIBUTES = new Set(['occasion', 'custom design']);

function parseIds(raw) {
  let list = raw;
  if (typeof raw === 'string') {
    try {
      list = JSON.parse(raw);
    } catch {
      list = [];
    }
  }
  return Array.isArray(list) ? list.map(String) : [];
}

export function buildCertificateRows({ productName, countryName, brandName, categoryName, attributes = [], selectedAttributeIds }) {
  const rows = [];
  const push = (label, value) => {
    const text = String(value ?? '').trim();
    if (text) rows.push({ label, value: text });
  };

  push('Item Name', productName);
  push('Country', countryName);
  push('Brand Name', brandName);
  push('Category', categoryName);

  const selected = new Set(parseIds(selectedAttributeIds));
  for (const attr of attributes || []) {
    const label = String(attr?.CategoryAttributeName || attr?.AttributeName || attr?.name || '').trim();
    if (!label || EXCLUDED_ATTRIBUTES.has(label.toLowerCase())) continue;
    if (selected.size && !selected.has(String(attr.CategoryAttributeID ?? ''))) continue;
    const raw = attr.CategoryAttributeValues ?? attr.AttributeValues ?? attr.value;
    const values = Array.isArray(raw) ? raw : String(raw ?? '').split(',');
    push(label, values.map((v) => String(v).trim()).filter(Boolean).join(', '));
  }

  return rows;
}

export const CERTIFICATE_STORAGE_KEY = 'certificate_preview';

export function openCertificateInNewTab(data) {
  try {
    localStorage.setItem(CERTIFICATE_STORAGE_KEY, JSON.stringify(data));
  } catch {
    return;
  }
  window.open('/certificate-preview', '_blank', 'noopener');
}
