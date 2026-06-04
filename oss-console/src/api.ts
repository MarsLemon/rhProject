export interface ConsoleConfig {
  bucket: string
  region: string
  publicUrl: string
  defaultPrefix: string
}

export interface OssFileRow {
  key: string
  name: string
  size: number
  lastModified: string
  publicUrl: string
}

export interface ListResult {
  prefix: string
  files: OssFileRow[]
  directories: string[]
  nextToken: string | null
  isTruncated: boolean
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const body = await res.json()
  if (!res.ok) {
    throw new Error(body.error ?? res.statusText)
  }
  return body as T
}

export function fetchConfig() {
  return getJson<ConsoleConfig>('/api/config')
}

export function listObjects(prefix: string, token?: string) {
  const q = new URLSearchParams({ prefix })
  if (token) q.set('token', token)
  return getJson<ListResult>(`/api/objects?${q}`)
}

export function deleteObjects(keys: string[]) {
  return getJson<{ deleted: string[]; failed: { key: string; error: string }[] }>('/api/objects/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keys })
  })
}

export function signObject(key: string) {
  return getJson<{ url: string }>(`/api/objects/sign?key=${encodeURIComponent(key)}`)
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}
