// 与后端 server/ 共用 shared/types.ts（消除 ConsoleConfig / OssFileRow / ListResult 重复）
import type { ConsoleConfig, ListResult, OssFileRow, UploadResult } from '../shared/types'

export type { ConsoleConfig, ListResult, OssFileRow, UploadResult }

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    // 错误路径不再先 res.json()，避免空 body / HTML 错误页（Vite 代理 500）触发
    // "Unexpected end of JSON input" 把 status 信息吞掉
    const raw = await res.text().catch(() => '')
    let detail = ''
    if (raw) {
      try {
        const body = JSON.parse(raw) as { error?: string }
        detail = body.error ? `: ${body.error}` : ''
      } catch {
        // 非 JSON body（Vite HTML 错误页、502/504）原样截前 200 字符提示
        detail = ` (non-JSON body: ${raw.slice(0, 200).replace(/\s+/g, ' ').trim()})`
      }
    }
    throw new Error(`HTTP ${res.status} ${res.statusText}${detail}`)
  }
  return (await res.json()) as T
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

export function signObject(key: string, expires = 3600) {
  return getJson<{ url: string }>(
    `/api/objects/sign?key=${encodeURIComponent(key)}&expires=${expires}`
  )
}

/**
 * 上传文件到后端（multipart/form-data）。
 * 用 XMLHttpRequest 而非 fetch，因为 fetch 的上传进度需要把 stream 拆 chunk 才能算；
 * XHR 的 xhr.upload.onprogress 是浏览器原生支持的发送进度事件。
 */
export function uploadFiles(
  files: File[],
  prefix: string,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  return new Promise<UploadResult>((resolve, reject) => {
    const form = new FormData()
    files.forEach((f) => form.append('files', f, f.name))

    const xhr = new XMLHttpRequest()
    const q = new URLSearchParams()
    if (prefix) q.set('prefix', prefix)
    const url = q.toString() ? `/api/objects/upload?${q}` : '/api/objects/upload'
    xhr.open('POST', url)

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }
    }

    xhr.onload = () => {
      try {
        const body = xhr.responseText ? JSON.parse(xhr.responseText) : {}
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(body as UploadResult)
        } else {
          reject(new Error(body.error ?? xhr.statusText ?? `HTTP ${xhr.status}`))
        }
      } catch {
        reject(new Error(xhr.statusText || 'parse error'))
      }
    }
    xhr.onerror = () => reject(new Error('network error'))
    xhr.onabort = () => reject(new Error('aborted'))

    xhr.send(form)
  })
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}
