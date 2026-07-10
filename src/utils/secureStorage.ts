export function setSecureItem(key: string, value: string, uid: string | null | undefined) {
  if (!uid) return;
  localStorage.setItem(`${uid}_${key}`, value);
}

export function getSecureItem(key: string, uid: string | null | undefined): string | null {
  if (!uid) return null;
  return localStorage.getItem(`${uid}_${key}`);
}
