export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
  return null;
}

export function setCookie(name: string, value: string, days: number = 1) {
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + days)
  document.cookie = `${name}=${value}; path=/; expires=${expirationDate.toUTCString()}`
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
}
