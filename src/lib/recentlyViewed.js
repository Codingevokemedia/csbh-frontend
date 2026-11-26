// Recently viewed products, kept in this browser only (localStorage). Each
// storefront records just its own product pages, so the list only ever holds
// this site's products. Items are the card-shaped product objects the site's
// product cards already render.
const STORAGE_KEY = "csbh.recentlyViewed.v1";
const MAX_ITEMS = 12;

export function getRecentlyViewed() {
  if (typeof window === "undefined") return [];
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(list) ? list.filter((item) => item && item.id != null) : [];
  } catch {
    return [];
  }
}

/** Records a product view and returns the updated list (newest first). */
export function addRecentlyViewed(item) {
  if (typeof window === "undefined" || !item || item.id == null) return getRecentlyViewed();
  const next = [
    item,
    ...getRecentlyViewed().filter((p) => String(p.id) !== String(item.id)),
  ].slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked — just skip saving */
  }
  return next;
}
