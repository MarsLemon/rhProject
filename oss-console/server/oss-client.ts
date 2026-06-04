import OSS from 'ali-oss'
import type { OssEnvConfig } from './oss-config.js'

export interface OssFileRow {
  key: string
  name: string
  size: number
  lastModified: string
  etag?: string
  publicUrl: string
}

export interface ListResult {
  prefix: string
  files: OssFileRow[]
  directories: string[]
  nextToken: string | null
  isTruncated: boolean
}

export function toFileRow(key: string, meta: { size?: number; lastModified?: Date | string; etag?: string }, publicUrl: string): OssFileRow {
  const lastModified =
    meta.lastModified instanceof Date
      ? meta.lastModified.toISOString()
      : meta.lastModified
        ? String(meta.lastModified)
        : ''

  return {
    key,
    name: key.split('/').filter(Boolean).pop() ?? key,
    size: meta.size ?? 0,
    lastModified,
    etag: meta.etag,
    publicUrl: publicUrl + key
  }
}

export function extractDirectories(objects: { name?: string }[] | undefined, prefix: string): string[] {
  const dirs = new Set<string>()
  const normalizedPrefix = prefix.endsWith('/') || !prefix ? prefix : `${prefix}/`

  for (const obj of objects ?? []) {
    const name = obj.name
    if (!name || !name.startsWith(normalizedPrefix) || name === normalizedPrefix) continue
    const rest = name.slice(normalizedPrefix.length)
    const slash = rest.indexOf('/')
    if (slash >= 0) {
      dirs.add(normalizedPrefix + rest.slice(0, slash + 1))
    }
  }

  return [...dirs].sort()
}

export function createOssClient(config: OssEnvConfig): OSS {
  return new OSS({
    region: config.region,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
    bucket: config.bucket,
    secure: true
  })
}

export async function listObjects(
  client: OSS,
  config: OssEnvConfig,
  prefix: string,
  continuationToken?: string,
  maxKeys = 100
): Promise<ListResult> {
  const result = await client.listV2({
    prefix: prefix || undefined,
    'max-keys': maxKeys,
    'continuation-token': continuationToken || undefined,
    delimiter: '/'
  })

  const prefixes = (result.prefixes ?? []) as string[]
  const files = (result.objects ?? [])
    .filter((obj) => obj.name && obj.name !== prefix && !obj.name.endsWith('/'))
    .map((obj) => toFileRow(obj.name!, { size: obj.size, lastModified: obj.lastModified, etag: obj.etag }, config.publicUrl))

  const directories = [...new Set([...prefixes, ...extractDirectories(result.objects, prefix)])].sort()

  return {
    prefix,
    files,
    directories,
    nextToken: result.nextContinuationToken ?? null,
    isTruncated: Boolean(result.isTruncated)
  }
}

export async function deleteObjects(client: OSS, keys: string[]): Promise<{ deleted: string[]; failed: { key: string; error: string }[] }> {
  const deleted: string[] = []
  const failed: { key: string; error: string }[] = []

  for (const key of keys) {
    try {
      await client.delete(key)
      deleted.push(key)
    } catch (e) {
      failed.push({ key, error: e instanceof Error ? e.message : String(e) })
    }
  }

  return { deleted, failed }
}

export async function signUrl(client: OSS, key: string, expiresSeconds = 3600): Promise<string> {
  return client.signatureUrl(key, { expires: expiresSeconds })
}
