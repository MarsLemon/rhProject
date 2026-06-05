// 前后端共享类型（消除 server/ 与 src/ 的 OssFileRow / ListResult 重复定义）
// 引用方式：
//   server/*.ts → import type { ... } from '../shared/types.js'
//   src/*.ts    → import type { ... } from '../../shared/types'

export interface OssFileRow {
  key: string
  name: string
  size: number
  lastModified: string
  etag?: string
  /** 公开桶：可直连；私有桶：此字段为 ''，需走 signatureUrl 预览 */
  publicUrl: string
}

export interface ListResult {
  prefix: string
  files: OssFileRow[]
  directories: string[]
  nextToken: string | null
  isTruncated: boolean
}

export interface UploadSuccessItem {
  key: string
  name: string
  size: number
  etag?: string
  /** 私有桶时为 ''，前端需走 /api/objects/sign?key=... 拿签名 URL */
  publicUrl: string
}

export interface UploadFailureItem {
  name: string
  error: string
}

export interface UploadResult {
  uploaded: UploadSuccessItem[]
  failed: UploadFailureItem[]
  prefix: string
}

export interface ConsoleConfig {
  bucket: string
  region: string
  /** 私有桶时为 '' */
  publicUrl: string
  defaultPrefix: string
  security: 'public' | 'private'
  /** 单文件最大字节数 */
  maxFileSize: number
}

export interface DeleteResult {
  deleted: string[]
  failed: { key: string; error: string }[]
}
