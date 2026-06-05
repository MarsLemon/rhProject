import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import multer from 'multer'
import { createOssClient, deleteObjects, listObjects, signUrl } from './oss-client.js'
import { loadOssConfig } from './oss-config.js'
import { createUploadMiddleware, uploadObjects } from './upload.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env')
const envExamplePath = path.resolve(__dirname, '../.env.example')

function startServer(): void {
  let config: ReturnType<typeof loadOssConfig>
  try {
    config = loadOssConfig()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('')
    console.error('❌ OSS console 启动失败：环境配置缺失')
    console.error('────────────────────────────────────────────')
    console.error(msg)
    console.error('')
    console.error(`📄 .env 路径：${envPath}`)
    console.error('   请确认以下字段已填写真实值（不要保留引号、不要保留占位符 your-bucket）：')
    console.error('')
    console.error('     OSS_BUCKET=<bucket 名>')
    console.error('     OSS_ACCESS_KEY_ID=<AccessKey ID>')
    console.error('     OSS_ACCESS_KEY_SECRET=<AccessKey Secret>')
    console.error('')
    console.error('📋 凭证来源：主项目 wk-train-center-service → 系统管理 → 存储配置 → 阿里云')
    console.error('📋 首次使用可从 .env.example 复制模板：')
    console.error(`     Linux/macOS:  cp "${envExamplePath}" "${envPath}"`)
    console.error(`     Windows   :  copy "${envExamplePath}" "${envPath}"`)
    console.error('────────────────────────────────────────────')
    process.exit(1)
  }

  const client = createOssClient(config)

  const app = express()
  app.use(cors())
  app.use(express.json())

  const uploadMw = createUploadMiddleware(config.maxFileSize, 50)

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, bucket: config.bucket, region: config.region })
  })

  app.get('/api/config', (_req, res) => {
    res.json({
      bucket: config.bucket,
      region: config.region,
      publicUrl: config.publicUrl,
      defaultPrefix: config.defaultPrefix,
      security: config.security,
      maxFileSize: config.maxFileSize
    })
  })

  app.get('/api/objects', async (req, res) => {
    try {
      const prefix = String(req.query.prefix ?? config.defaultPrefix)
      const token = req.query.token ? String(req.query.token) : undefined
      const maxKeys = req.query.maxKeys ? Number(req.query.maxKeys) : 100
      const data = await listObjects(client, config, prefix, token, maxKeys)
      res.json(data)
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  app.post('/api/objects/delete', async (req, res) => {
    try {
      const rawKeys: unknown[] = Array.isArray(req.body?.keys) ? req.body.keys : []
      const keys = rawKeys
        .filter((k): k is string => typeof k === 'string')
        .map((k) => k.trim())
        .filter((k) => k.length > 0)
      if (keys.length === 0) {
        res.status(400).json({ error: 'keys required' })
        return
      }
      const result = await deleteObjects(client, keys)
      res.json(result)
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  app.get('/api/objects/sign', async (req, res) => {
    try {
      const key = String(req.query.key ?? '')
      if (!key) {
        res.status(400).json({ error: 'key required' })
        return
      }
      const rawExpires = Number(req.query.expires ?? '3600')
      const expires = Number.isFinite(rawExpires) ? Math.floor(rawExpires) : 3600
      // 限定 [60, 86400]，防误传极大值导致签名 URL 长期有效
      const clamped = Math.min(86400, Math.max(60, expires))
      const url = await signUrl(client, key, clamped)
      res.json({ url })
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  app.post('/api/objects/upload', (req, res) => {
    uploadMw(req, res, async (err) => {
      if (err) {
        const msg = err instanceof multer.MulterError
          ? `${err.field ?? 'files'}: ${err.message}`
          : err.message
        res.status(400).json({ error: msg })
        return
      }
      try {
        const files = (req.files as Express.Multer.File[] | undefined) ?? []
        if (files.length === 0) {
          res.status(400).json({ error: 'no files in form-data (field: files)' })
          return
        }
        const prefix = String(req.query.prefix ?? '')
        const result = await uploadObjects(client, config, files, prefix)
        res.json(result)
      } catch (e) {
        res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
      }
    })
  })

  app.listen(config.port, () => {
    console.log(`OSS console API http://127.0.0.1:${config.port}`)
    console.log(`Bucket: ${config.bucket}  prefix: ${config.defaultPrefix || '(root)'}`)
    console.log(`Security: ${config.security}  maxFileSize: ${config.maxFileSize} bytes`)
  })
}

startServer()
