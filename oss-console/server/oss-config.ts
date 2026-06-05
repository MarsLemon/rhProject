import dotenv from 'dotenv'

dotenv.config()

export interface OssEnvConfig {
  endpoint: string
  region: string
  bucket: string
  accessKeyId: string
  accessKeySecret: string
  publicUrl: string
  defaultPrefix: string
  port: number
  /** 主项目 OssConfig.arn —— 本工具用不到 STS，留字段占位 */
  arn: string
  /** 主项目 OssConfig.url —— 私有桶授权接口路径（占位） */
  url: string
  security: 'public' | 'private'
  /** 单文件最大字节数；超过 multer 报 400 */
  maxFileSize: number
}

const DEFAULT_MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

/** Strip protocol / domain suffix; align with wk-train-center OssConfig.endpoint (e.g. oss-cn-hangzhou). */
export function normalizeEndpoint(raw: string): string {
  let value = raw.trim()
  if (!value) return 'oss-cn-hangzhou'

  value = value.replace(/^https?:\/\//, '')
  const hostPart = value.split('/')[0] ?? value

  if (hostPart.includes('.aliyuncs.com')) {
    const bucketDot = hostPart.indexOf('.')
    if (bucketDot > 0 && !hostPart.startsWith('oss-')) {
      return hostPart.slice(bucketDot + 1).replace('.aliyuncs.com', '')
    }
    return hostPart.replace('.aliyuncs.com', '')
  }

  return hostPart
}

export function buildPublicUrl(
  bucket: string,
  region: string,
  security: 'public' | 'private',
  override?: string
): string {
  if (security === 'private') return '' // 私有桶直连必然 403，必须走 signatureUrl
  const trimmed = override?.trim()
  if (trimmed) {
    return trimmed.endsWith('/') ? trimmed : `${trimmed}/`
  }
  return `https://${bucket}.${region}.aliyuncs.com/`
}

function readEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim()
    if (value) return value
  }
  return ''
}

/** 大小写不敏感；缺省/未知值退化为 'public'（历史行为：直连 url 走 SDK 默认） */
function parseSecurity(raw: string): 'public' | 'private' {
  const v = (raw || '').toLowerCase()
  return v === 'private' ? 'private' : 'public'
}

function parseMaxFileSize(raw: string): number {
  if (!raw) return DEFAULT_MAX_FILE_SIZE
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_MAX_FILE_SIZE
  return Math.floor(n)
}

export function loadOssConfig(): OssEnvConfig {
  const endpoint = normalizeEndpoint(
    readEnv('endpoint', 'OSS_ENDPOINT', 'OSS_REGION', 'region') || 'oss-cn-hangzhou'
  )
  const bucket = readEnv('bucket', 'OSS_BUCKET')
  const accessKeyId = readEnv('accessKeyId', 'OSS_ACCESS_KEY_ID', 'ACCESS_KEY_ID')
  const accessKeySecret = readEnv('accessKeySecret', 'OSS_ACCESS_KEY_SECRET', 'ACCESS_KEY_SECRET')
  const accelerate = readEnv('accelerate', 'OSS_ACCELERATE', 'OSS_PUBLIC_URL')
  const security = parseSecurity(readEnv('security', 'OSS_SECURITY'))
  const publicUrl = buildPublicUrl(bucket, endpoint, security, accelerate)
  const defaultPrefix = readEnv('defaultPrefix', 'OSS_DEFAULT_PREFIX')
  const arn = readEnv('arn', 'OSS_ARN')
  const url = readEnv('url', 'OSS_URL')
  const maxFileSize = parseMaxFileSize(readEnv('maxFileSize', 'OSS_MAX_FILE_SIZE'))
  const port = Number(readEnv('PORT') || '8101')

  if (!bucket || !accessKeyId || !accessKeySecret) {
    throw new Error(
      'Missing bucket / accessKeyId / accessKeySecret in .env — copy from 系统管理 → 存储配置 → 阿里云'
    )
  }

  return {
    endpoint,
    region: endpoint,
    bucket,
    accessKeyId,
    accessKeySecret,
    publicUrl,
    defaultPrefix,
    port,
    arn,
    url,
    security,
    maxFileSize
  }
}
