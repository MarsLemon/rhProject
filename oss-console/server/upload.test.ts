import { describe, expect, it, vi } from 'vitest'
import OSS from 'ali-oss'
import { uploadObjects } from './upload.js'
import type { OssEnvConfig } from './oss-config.js'

const baseConfig: OssEnvConfig = {
  endpoint: 'oss-cn-hangzhou',
  region: 'oss-cn-hangzhou',
  bucket: 'bkt',
  accessKeyId: 'ak',
  accessKeySecret: 'sk',
  publicUrl: 'https://bkt.oss-cn-hangzhou.aliyuncs.com/',
  defaultPrefix: 'AI-training/',
  port: 8101,
  arn: '',
  url: '',
  security: 'public',
  maxFileSize: 500 * 1024 * 1024
}

function makeFile(name: string, content = 'x'): Express.Multer.File {
  return {
    fieldname: 'files',
    originalname: name,
    encoding: '7bit',
    mimetype: 'application/octet-stream',
    size: content.length,
    buffer: Buffer.from(content),
    destination: '',
    filename: '',
    path: ''
  } as Express.Multer.File
}

function makeClient(putImpl: (key: string, buf: Buffer) => Promise<any>): OSS {
  return {
    put: vi.fn(putImpl)
  } as unknown as OSS
}

describe('uploadObjects', () => {
  it('uploads valid files and reports them in uploaded[]', async () => {
    const client = makeClient(async () => ({ res: { headers: { etag: 'abc' } } }))
    const result = await uploadObjects(
      client, baseConfig, [makeFile('a.pdf'), makeFile('b.docx')], ''
    )
    expect(result.uploaded).toHaveLength(2)
    expect(result.uploaded[0].key).toBe('AI-training/a.pdf')
    expect(result.uploaded[0].publicUrl).toBe('https://bkt.oss-cn-hangzhou.aliyuncs.com/AI-training/a.pdf')
    expect(result.failed).toEqual([])
  })

  it('rejects non-whitelisted extensions into failed[]', async () => {
    const client = makeClient(async () => ({ res: { headers: {} } }))
    const result = await uploadObjects(client, baseConfig, [makeFile('evil.exe')], '')
    expect(result.uploaded).toEqual([])
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0].error).toContain('extension')
  })

  it('rejects path-traversal filenames into failed[]', async () => {
    const client = makeClient(async () => ({ res: { headers: {} } }))
    const result = await uploadObjects(
      client, baseConfig, [makeFile('../../etc/passwd')], 'AI-training/'
    )
    expect(result.uploaded).toEqual([])
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0].error).toContain('invalid key')
  })

  it('returns empty publicUrl for private bucket', async () => {
    const client = makeClient(async () => ({ res: { headers: {} } }))
    const cfg: OssEnvConfig = { ...baseConfig, security: 'private', publicUrl: '' }
    const result = await uploadObjects(client, cfg, [makeFile('a.pdf')], '')
    expect(result.uploaded[0].publicUrl).toBe('')
  })

  it('records put errors in failed[] without aborting the batch', async () => {
    const client = makeClient(async (key) => {
      if (key.endsWith('a.pdf')) throw new Error('network down')
      return { res: { headers: {} } }
    })
    const result = await uploadObjects(
      client, baseConfig, [makeFile('a.pdf'), makeFile('b.pdf')], ''
    )
    expect(result.uploaded.map((u) => u.name)).toEqual(['b.pdf'])
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0].error).toContain('network down')
  })

  it('uses provided prefix when rawPrefix is non-empty', async () => {
    const client = makeClient(async () => ({ res: { headers: {} } }))
    const result = await uploadObjects(client, baseConfig, [makeFile('a.pdf')], 'custom/')
    expect(result.uploaded[0].key).toBe('custom/a.pdf')
    expect(result.prefix).toBe('custom/')
  })

  it('preserves utf-8 filenames in key', async () => {
    const client = makeClient(async () => ({ res: { headers: {} } }))
    const result = await uploadObjects(client, baseConfig, [makeFile('中文课件.pdf')], '')
    expect(result.uploaded[0].key).toBe('AI-training/中文课件.pdf')
  })
})
