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
}

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

export function buildPublicUrl(bucket: string, region: string, override?: string): string {
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

export function loadOssConfig(): OssEnvConfig {
  const endpoint = normalizeEndpoint(
    readEnv('endpoint', 'OSS_ENDPOINT', 'OSS_REGION', 'region') || 'oss-cn-hangzhou'
  )
  const bucket = readEnv('bucket', 'OSS_BUCKET')
  const accessKeyId = readEnv('accessKeyId', 'OSS_ACCESS_KEY_ID', 'ACCESS_KEY_ID')
  const accessKeySecret = readEnv('accessKeySecret', 'OSS_ACCESS_KEY_SECRET', 'ACCESS_KEY_SECRET')
  const accelerate = readEnv('accelerate', 'OSS_ACCELERATE', 'OSS_PUBLIC_URL')
  const publicUrl = buildPublicUrl(bucket, endpoint, accelerate)
  const defaultPrefix = readEnv('defaultPrefix', 'OSS_DEFAULT_PREFIX')
  const port = Number(readEnv('PORT') || '5179')

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
    port
  }
}
