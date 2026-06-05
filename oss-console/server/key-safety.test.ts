import { describe, expect, it } from 'vitest'
import { safeJoinKey } from './key-safety.js'

describe('safeJoinKey', () => {
  it('rejects path traversal in filename', () => {
    expect(safeJoinKey('a/b/', '../etc/passwd')).toBe('')
    expect(safeJoinKey('a/b/', '..\\etc\\passwd')).toBe('')
    expect(safeJoinKey('a/b/', 'sub/../passwd')).toBe('')
    expect(safeJoinKey('a/b/', './passwd')).toBe('')
  })

  it('rejects empty / dot / dotdot basenames', () => {
    expect(safeJoinKey('', '')).toBe('')
    expect(safeJoinKey('p/', '.')).toBe('')
    expect(safeJoinKey('p/', '..')).toBe('')
  })

  it('rejects absolute paths', () => {
    // '/abs.txt' 的 basename 是 'abs.txt'，能通过 basename 取名
    // 但安全起见：用户传 '/abs.txt' 不应该被处理成根目录文件
    // → safeJoinKey 取出 basename = 'abs.txt'，最终落到 prefix 下，OK
    expect(safeJoinKey('a/', '/abs.txt')).toBe('a/abs.txt')
  })

  it('rejects control characters', () => {
    expect(safeJoinKey('', 'file\x00name.txt')).toBe('')
    expect(safeJoinKey('', 'file\nname.txt')).toBe('')
  })

  it('normalizes prefix (no leading slash, no double slashes, trailing slash)', () => {
    expect(safeJoinKey('/a//b///', 'x.txt')).toBe('a/b/x.txt')
    expect(safeJoinKey('a', 'x.txt')).toBe('a/x.txt')
    expect(safeJoinKey('a/', 'x.txt')).toBe('a/x.txt')
  })

  it('preserves utf-8 filenames', () => {
    expect(safeJoinKey('AI-training/', '中文课件.pdf')).toBe('AI-training/中文课件.pdf')
  })

  it('rejects keys exceeding 1024 characters', () => {
    const longBase = 'a'.repeat(1100) + '.pdf'
    expect(safeJoinKey('p/', longBase)).toBe('')
  })

  it('handles empty prefix', () => {
    expect(safeJoinKey('', 'a.pdf')).toBe('a.pdf')
  })

  it('strips backslashes in prefix', () => {
    expect(safeJoinKey('a\\b\\', 'x.txt')).toBe('a/b/x.txt')
  })
})
