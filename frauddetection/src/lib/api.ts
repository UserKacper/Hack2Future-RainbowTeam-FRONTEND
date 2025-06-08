import { getCookie } from "./handle-cookies"

interface FetchOptions extends Omit<RequestInit, 'body'> {
  jsonBody?: unknown;
}

export async function fetchWithAuth(url: string, options: FetchOptions = {}) {
  const token = getCookie('token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  }

  const config = {
    ...options,
    headers,
    body: options.jsonBody ? JSON.stringify(options.jsonBody) : undefined,
  }

  const response = await fetch(url, config)
  
  // If response is 401 Unauthorized, redirect to login
  if (response.status === 401) {
    window.location.href = '/login'
    return null
  }

  return response
}

export async function apiGet(url: string) {
  return fetchWithAuth(url)
}

export async function apiPost(url: string, data: unknown) {
  return fetchWithAuth(url, {
    method: 'POST',
    jsonBody: data,
  })
}

export async function apiPut(url: string, data: unknown) {
  return fetchWithAuth(url, {
    method: 'PUT',
    jsonBody: data,
  })
}

export async function apiDelete(url: string) {
  return fetchWithAuth(url, {
    method: 'DELETE',
  })
}
