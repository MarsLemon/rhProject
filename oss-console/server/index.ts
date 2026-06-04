import cors from 'cors'
import express from 'express'
import { createOssClient, deleteObjects, listObjects, signUrl } from './oss-client.js'
import { loadOssConfig } from './oss-config.js'

const config = loadOssConfig()
const client = createOssClient(config)

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, bucket: config.bucket, region: config.region })
})

app.get('/api/config', (_req, res) => {
  res.json({
    bucket: config.bucket,
    region: config.region,
    publicUrl: config.publicUrl,
    defaultPrefix: config.defaultPrefix
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
    const keys: string[] = Array.isArray(req.body?.keys) ? req.body.keys : []
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
    const url = await signUrl(client, key)
    res.json({ url })
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
  }
})

app.listen(config.port, () => {
  console.log(`OSS console API http://127.0.0.1:${config.port}`)
  console.log(`Bucket: ${config.bucket}  prefix: ${config.defaultPrefix || '(root)'}`)
})
