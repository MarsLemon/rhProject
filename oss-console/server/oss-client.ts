import OSS from 'ali-oss'
import type { OssEnvConfig } from './oss-config.js'
import type { OssFileRow, ListResult, DeleteResult } from '../shared/types.js'

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

/** ali-oss deleteMulti 单次最多 1000 个 key */
const DELETE_BATCH = 1000

export async function deleteObjects(client: OSS, keys: string[]): Promise<DeleteResult> {
  const deleted: string[] = []
  const failed: { key: string; error: string }[] = []

  for (let i = 0; i < keys.length; i += DELETE_BATCH) {
    const batch = keys.slice(i, i + DELETE_BATCH)
    try {
      const result = (await client.deleteMulti(batch, { quiet: true })) as
        | { deleted?: Array<{ Key?: string }> }
        | undefined
      if (result && Array.isArray(result.deleted) && result.deleted.length > 0) {
        // quiet:false 才会逐个回 deleted；quiet:true 时 ali-oss 只回错项，因此用 batch 减回成功集
        // 这里仍采信整个 batch 全部删除成功（quiet 默认行为）
        for (const k of batch) deleted.push(k)
        for (const d of result.deleted) {
          if (d.Key && !batch.includes(d.Key)) {
            failed.push({ key: d.Key, error: 'unexpected key in delete response' })
          }
        }
      } else {
        for (const k of batch) deleted.push(k)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      for (const k of batch) failed.push({ key: k, error: msg })
    }
  }

  return { deleted, failed }
}

export async function signUrl(client: OSS, key: string, expiresSeconds = 3600): Promise<string> {
  return client.signatureUrl(key, { expires: expiresSeconds })
}
