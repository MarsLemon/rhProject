// 上传处理：multer 内存模式 + 串行 client.put + 扩展名白名单 + key 安全校验
// 不接 STS、不分片、不直传 OSS。本机自用，500MB 内单 put 足够。

import multer from 'multer'
import OSS from 'ali-oss'
import { safeJoinKey } from './key-safety.js'
import type {
  UploadResult,
  UploadSuccessItem,
  UploadFailureItem
} from '../shared/types.js'
import type { OssEnvConfig } from './oss-config.js'

const ALLOWED_EXT = new Set([
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'md', 'csv',
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp',
  'mp4', 'mp3', 'wav', 'mov', 'avi', 'mkv', 'm4a',
  'zip', 'rar', '7z', 'tar', 'gz'
])

export function createUploadMiddleware(maxFileSize: number, maxFiles = 50) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxFileSize, files: maxFiles }
  }).array('files', maxFiles)
}

export async function uploadObjects(
  client: OSS,
  config: OssEnvConfig,
  files: Express.Multer.File[],
  rawPrefix: string
): Promise<UploadResult> {
  const prefix = (rawPrefix || config.defaultPrefix || '').trim()
  const uploaded: UploadSuccessItem[] = []
  const failed: UploadFailureItem[] = []

  for (const file of files) {
    const key = safeJoinKey(prefix, file.originalname)
    if (!key) {
      failed.push({ name: file.originalname, error: 'invalid key (path traversal or bad chars)' })
      continue
    }
    const ext = (file.originalname.split('.').pop() || '').toLowerCase()
    if (ext && !ALLOWED_EXT.has(ext)) {
      failed.push({ name: file.originalname, error: `extension .${ext} not allowed` })
      continue
    }
    try {
      const putResult = (await client.put(key, file.buffer, {
        headers: { 'Cache-Control': 'max-age=31536000' }
      })) as { res?: { headers?: { etag?: string } } }
      const etag = putResult.res?.headers?.etag
      uploaded.push({
        key,
        name: file.originalname,
        size: file.size,
        etag,
        publicUrl: config.security === 'private' ? '' : config.publicUrl + key
      })
    } catch (e) {
      failed.push({
        name: file.originalname,
        error: e instanceof Error ? e.message : String(e)
      })
    }
  }

  return { uploaded, failed, prefix }
}

export const _internal = { ALLOWED_EXT }
