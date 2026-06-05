// OSS key 安全校验：防止 `../` 越界、控制字符、长度上限。
// 用于上传 / 删除 / 列表等所有接受外部 key 的入口。

const MAX_KEY_LEN = 1024
const INVALID_CHARS = /[\u0000-\u001f\u007f]/

/**
 * 拼接 prefix + 文件名为 OSS key；不合法返回 ''。
 *
 * 规则：
 * - basename only：取最后一段 `a/b/c.txt` → `c.txt`（防 `../` 越界）
 * - 拒绝 basename 为 `.` / `..` / 空
 * - 拒绝含控制字符
 * - normalize prefix：以 `/` 结尾、不出现 `//`、不出现 `../`、去除反斜杠
 * - 拒绝长度 > 1024
 */
export function safeJoinKey(prefix: string, filename: string): string {
  if (!filename) return ''

  const parts = filename.split(/[\\/]/)
  // 拒绝任何路径段是 '.' / '..' 的输入（防 ../xxx、sub/../xxx、./xxx）
  // —— basename-only 会让 sub/../passwd 坍缩成 passwd，但用户写 sub/.. 本就是可疑输入
  if (parts.some((p) => p === '.' || p === '..')) return ''

  const base = parts[parts.length - 1] ?? ''
  if (!base) return ''

  if (INVALID_CHARS.test(base)) return ''

  let p = (prefix || '').replace(/\\/g, '/').trim()
  if (p.startsWith('/')) p = p.slice(1)
  if (p && !p.endsWith('/')) p = p + '/'
  p = p.replace(/\/{2,}/g, '/')

  const full = p + base
  if (full.length > MAX_KEY_LEN) return ''
  return full
}
