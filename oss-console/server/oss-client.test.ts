import { describe, expect, it } from 'vitest'
import { extractDirectories, toFileRow } from './oss-client.js'

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
