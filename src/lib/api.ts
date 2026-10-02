export async function api<Result>(path: string, options: RequestInit = {}): Promise<Result> {
  const response = await fetch(`/api/study${path}`, {
    ...options,
    credentials: 'same-origin',
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Le service est momentanément indisponible. Réessayez.')
  return data as Result
}
