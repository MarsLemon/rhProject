import { describe, expect, it, vi } from 'vitest'
import OSS from 'ali-oss'
import { deleteObjects, extractDirectories, toFileRow } from './oss-client.js'

describe('toFileRow', () => {
  it('maps OSS object to row with public URL', () => {
    const row = toFileRow(
      'dev/AI-training/a.pdf',
      { size: 1024, lastModified: new Date('2026-01-01T00:00:00.000Z'), etag: '"abc"' },
      'https://bkt.oss-cn-hangzhou.aliyuncs.com/'
    )
    expect(row.name).toBe('a.pdf')
    expect(row.size).toBe(1024)
    expect(row.publicUrl).toBe('https://bkt.oss-cn-hangzhou.aliyuncs.com/dev/AI-training/a.pdf')
  })
})

describe('extractDirectories', () => {
  it('collects immediate child prefixes', () => {
    const dirs = extractDirectories(
      [
        { name: 'dev/AI-training/tempFile/x.txt' },
        { name: 'dev/AI-training/course/a.mp4' },
        { name: 'dev/AI-training/course/b.mp4' }
      ],
      'dev/AI-training/'
    )
    expect(dirs).toEqual(['dev/AI-training/course/', 'dev/AI-training/tempFile/'])
  })
})

function makeClient(impl: (keys: string[], opts: any) => Promise<any>): OSS {
  return {
    deleteMulti: vi.fn(impl)
  } as unknown as OSS
}

describe('deleteObjects', () => {
  it('calls deleteMulti once with quiet:true for small batches', async () => {
    const client = makeClient(async () => ({}))
    const result = await deleteObjects(client, ['a', 'b', 'c'])
    expect(client.deleteMulti).toHaveBeenCalledTimes(1)
    expect(client.deleteMulti).toHaveBeenCalledWith(['a', 'b', 'c'], { quiet: true })
    expect(result.deleted).toEqual(['a', 'b', 'c'])
    expect(result.failed).toEqual([])
  })

  it('splits large batches (>1000) into chunks of 1000', async () => {
    const client = makeClient(async () => ({}))
    const keys = Array.from({ length: 2500 }, (_, i) => `k${i}`)
    const result = await deleteObjects(client, keys)
    expect(client.deleteMulti).toHaveBeenCalledTimes(3) // 1000 + 1000 + 500
    expect(result.deleted).toHaveLength(2500)
    expect(result.failed).toEqual([])
  })

  it('records all keys in failed[] when deleteMulti throws', async () => {
    const client = makeClient(async () => {
      throw new Error('boom')
    })
    const result = await deleteObjects(client, ['a', 'b'])
    expect(result.deleted).toEqual([])
    expect(result.failed).toEqual([
      { key: 'a', error: 'boom' },
      { key: 'b', error: 'boom' }
    ])
  })
})
