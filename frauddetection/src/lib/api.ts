import { getCookie } from "./handle-cookies"

interface FetchOptions extends Omit<RequestInit, 'body'> {
  jsonBody?: unknown;
}

export async function fetchWithAuth(url: string, options: FetchOptions = {}) {
  const token = getCookie('token')
    const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  }
  
  console.log('API Request:', {
    url,
    token: token ? 'present' : 'missing',
    headers
  })

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

export async function apiGet(url: string, options: Omit<FetchOptions, 'method'> = {}) {
  return fetchWithAuth(url, { ...options, method: 'GET' })
}

export async function apiPost(url: string, data?: unknown, options: Omit<FetchOptions, 'method' | 'jsonBody'> = {}) {
  return fetchWithAuth(url, {
    ...options,
    method: 'POST',
    jsonBody: data,
  })
}

export async function apiPut(url: string, data?: unknown, options: Omit<FetchOptions, 'method' | 'jsonBody'> = {}) {
  return fetchWithAuth(url, {
    ...options,
    method: 'PUT',
    jsonBody: data,
  })
}

export async function apiDelete(url: string, options: Omit<FetchOptions, 'method'> = {}) {
  return fetchWithAuth(url, { ...options, method: 'DELETE' })
}
