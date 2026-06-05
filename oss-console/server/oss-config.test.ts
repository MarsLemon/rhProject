import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildPublicUrl, loadOssConfig, normalizeEndpoint } from './oss-config.js'

describe('normalizeEndpoint', () => {
  it('keeps bare region id', () => {
    expect(normalizeEndpoint('oss-cn-hangzhou')).toBe('oss-cn-hangzhou')
  })

  it('strips aliyuncs.com suffix', () => {
    expect(normalizeEndpoint('oss-cn-beijing.aliyuncs.com')).toBe('oss-cn-beijing')
  })

  it('extracts region from bucket host', () => {
    expect(normalizeEndpoint('my-bucket.oss-cn-qingdao.aliyuncs.com')).toBe('oss-cn-qingdao')
  })

  it('strips https protocol', () => {
    expect(normalizeEndpoint('https://oss-cn-shanghai.aliyuncs.com')).toBe('oss-cn-shanghai')
  })
})

describe('buildPublicUrl', () => {
  it('builds default bucket URL with trailing slash', () => {
    expect(buildPublicUrl('bkt', 'oss-cn-hangzhou', 'public')).toBe('https://bkt.oss-cn-hangzhou.aliyuncs.com/')
  })

  it('uses override and ensures trailing slash', () => {
    expect(buildPublicUrl('bkt', 'oss-cn-hangzhou', 'public', 'https://cdn.example.com/files')).toBe(
      'https://cdn.example.com/files/'
    )
  })

  it('returns empty string for private bucket (direct GET would 403)', () => {
    expect(buildPublicUrl('bkt', 'oss-cn-hangzhou', 'private')).toBe('')
    expect(buildPublicUrl('bkt', 'oss-cn-hangzhou', 'private', 'https://cdn.example.com')).toBe('')
  })
})

describe('loadOssConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('reads train-center field names from env', () => {
    vi.stubEnv('endpoint', 'oss-cn-beijing')
    vi.stubEnv('bucket', 'my-bucket')
    vi.stubEnv('accessKeyId', 'ak')
    vi.stubEnv('accessKeySecret', 'sk')
    vi.stubEnv('accelerate', 'https://cdn.example.com/')

    const config = loadOssConfig()
    expect(config.region).toBe('oss-cn-beijing')
    expect(config.bucket).toBe('my-bucket')
    expect(config.publicUrl).toBe('https://cdn.example.com/')
  })

  it('falls back to legacy OSS_* env names', () => {
    vi.stubEnv('OSS_ENDPOINT', 'oss-cn-shanghai')
    vi.stubEnv('OSS_BUCKET', 'legacy-bucket')
    vi.stubEnv('OSS_ACCESS_KEY_ID', 'ak2')
    vi.stubEnv('OSS_ACCESS_KEY_SECRET', 'sk2')

    const config = loadOssConfig()
    expect(config.region).toBe('oss-cn-shanghai')
    expect(config.bucket).toBe('legacy-bucket')
  })

  it('defaults security=public and maxFileSize=500MB', () => {
    vi.stubEnv('bucket', 'b1')
    vi.stubEnv('accessKeyId', 'ak')
    vi.stubEnv('accessKeySecret', 'sk')
    // 显式清空 accelerate 相关变量，防 OS env 泄漏
    vi.stubEnv('accelerate', '')
    vi.stubEnv('OSS_ACCELERATE', '')
    vi.stubEnv('OSS_PUBLIC_URL', '')

    const config = loadOssConfig()
    expect(config.security).toBe('public')
    expect(config.maxFileSize).toBe(500 * 1024 * 1024)
    expect(config.publicUrl).toBe('https://b1.oss-cn-hangzhou.aliyuncs.com/')
  })

  it('parses security=PRIVATE (case-insensitive) and clears publicUrl', () => {
    vi.stubEnv('bucket', 'b1')
    vi.stubEnv('accessKeyId', 'ak')
    vi.stubEnv('accessKeySecret', 'sk')
    vi.stubEnv('security', 'PRIVATE')
    vi.stubEnv('accelerate', 'https://cdn.example.com/')

    const config = loadOssConfig()
    expect(config.security).toBe('private')
    expect(config.publicUrl).toBe('')
  })

  it('reads maxFileSize override and rejects garbage values', () => {
    vi.stubEnv('bucket', 'b1')
    vi.stubEnv('accessKeyId', 'ak')
    vi.stubEnv('accessKeySecret', 'sk')
    vi.stubEnv('maxFileSize', '104857600')

    const config = loadOssConfig()
    expect(config.maxFileSize).toBe(104857600)

    vi.stubEnv('maxFileSize', 'not-a-number')
    expect(loadOssConfig().maxFileSize).toBe(500 * 1024 * 1024)
  })
})
