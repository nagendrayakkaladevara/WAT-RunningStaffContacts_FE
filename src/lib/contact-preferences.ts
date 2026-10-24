import { useSyncExternalStore } from "react";

type Preferences = {
  favorites: string[];
  recent: string[];
  phones: Record<string, string>;
};
const key = "wat-contact-preferences-v1";
const empty: Preferences = { favorites: [], recent: [], phones: {} };
function read(): Preferences {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    const ids = (v: unknown, max: number): string[] =>
      Array.isArray(v)
        ? [
            ...new Set(v.filter((id): id is string => typeof id === "string")),
          ].slice(0, max)
        : [];
    const favorites = ids(value?.favorites, 100),
      recent = ids(value?.recent, 12);
    const phones = Object.fromEntries(
      [...favorites, ...recent]
        .filter((id) => typeof value?.phones?.[id] === "string")
        .map((id) => [id, value.phones[id]]),
    );
    return { favorites, recent, phones };
  } catch {
    return empty;
  }
}
let snapshot = read();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());
function update(next: Preferences) {
  const keep = new Set([...next.favorites, ...next.recent]);
  next.phones = Object.fromEntries(
    Object.entries(next.phones).filter(([id]) => keep.has(id)),
  );
  snapshot = next;
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* Session-only when storage is unavailable. */
  }
  notify();
}
window.addEventListener("storage", (event) => {
  if (event.key === key || event.key === null) {
    snapshot = read();
    notify();
  }
});
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export function useContactPreferences() {
  return useSyncExternalStore(subscribe, () => snapshot);
}
export function toggleFavorite(id: string, phone = "") {
  update({
    ...snapshot,
    phones: { ...snapshot.phones, [id]: phone || snapshot.phones[id] || "" },
    favorites: snapshot.favorites.includes(id)
      ? snapshot.favorites.filter((item) => item !== id)
      : [id, ...snapshot.favorites].slice(0, 100),
  });
}
export function recordViewed(id: string, phone = "") {
  update({
    ...snapshot,
    phones: { ...snapshot.phones, [id]: phone || snapshot.phones[id] || "" },
    recent: [id, ...snapshot.recent.filter((item) => item !== id)].slice(0, 12),
  });
}
export function clearRecent() {
  update({ ...snapshot, recent: [] });
}
