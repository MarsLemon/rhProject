<script setup lang="ts">
import { ElMessage, ElMessageBox, type UploadRequestOptions } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import {
  deleteObjects,
  fetchConfig,
  formatBytes,
  listObjects,
  signObject,
  uploadFiles,
  type ConsoleConfig,
  type OssFileRow
} from './api'

const config = ref<ConsoleConfig | null>(null)
const prefix = ref('')
const files = ref<OssFileRow[]>([])
const directories = ref<string[]>([])
const selectedKeys = ref<string[]>([])
const loading = ref(false)
const nextToken = ref<string | null>(null)
const tokenStack = ref<string[]>([])
const uploadPercent = ref(0)

// 与 server/upload.ts ALLOWED_EXT 保持一致；浏览器侧只是体验过滤，真正的白名单校验在后端
const ACCEPT_EXT =
  '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.csv,' +
  '.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,' +
  '.mp4,.mp3,.wav,.mov,.avi,.mkv,.m4a,' +
  '.zip,.rar,.7z,.tar,.gz'

const breadcrumbParts = computed(() => {
  const p = prefix.value || ''
  if (!p) return [{ label: '(root)', path: '' }]
  const segments = p.split('/').filter(Boolean)
  const parts = [{ label: '(root)', path: '' }]
  let acc = ''
  for (const seg of segments) {
    acc += seg + '/'
    parts.push({ label: seg, path: acc })
  }
  return parts
})

async function loadList(continuationToken?: string, pushHistory = false) {
  loading.value = true
  selectedKeys.value = []
  try {
    const data = await listObjects(prefix.value, continuationToken)
    files.value = data.files
    directories.value = data.directories
    nextToken.value = data.nextToken
    if (pushHistory && continuationToken) {
      tokenStack.value.push(continuationToken)
    }
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e))
  } finally {
    loading.value = false
  }
}

function navigatePrefix(path: string) {
  prefix.value = path
  tokenStack.value = []
  loadList()
}

function enterDirectory(dir: string) {
  prefix.value = dir
  tokenStack.value = []
  loadList()
}

function loadNextPage() {
  if (nextToken.value) loadList(nextToken.value, true)
}

function loadPrevPage() {
  tokenStack.value.pop()
  const token = tokenStack.value[tokenStack.value.length - 1]
  loadList(token)
}

async function copyKey(key: string) {
  await navigator.clipboard.writeText(key)
  ElMessage.success('Key 已复制')
}

async function previewFile(row: OssFileRow) {
  // 公开桶：publicUrl 是完整直连 URL，直接打开
  if (row.publicUrl) {
    window.open(row.publicUrl, '_blank')
    return
  }
  // 私有桶：publicUrl === ''，必须走签名 URL
  try {
    const { url } = await signObject(row.key)
    window.open(url, '_blank')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e))
  }
}

async function confirmDelete() {
  if (selectedKeys.value.length === 0) return
  // ElMessageBox.confirm 用户取消时会 reject，必须 try/catch 接住
  try {
    await ElMessageBox.confirm(
      `确定删除 ${selectedKeys.value.length} 个对象？不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    )
  } catch {
    return
  }
  loading.value = true
  try {
    const result = await deleteObjects(selectedKeys.value)
    if (result.failed.length) {
      ElMessage.warning(`已删 ${result.deleted.length}，失败 ${result.failed.length}`)
    } else {
      ElMessage.success(`已删除 ${result.deleted.length} 个文件`)
    }
    await loadList(tokenStack.value[tokenStack.value.length - 1])
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e))
  } finally {
    loading.value = false
  }
}

async function customUpload(options: UploadRequestOptions) {
  uploadPercent.value = 0
  try {
    const file = options.file
    if (!file) return
    const result = await uploadFiles([file], prefix.value, (p) => (uploadPercent.value = p))
    uploadPercent.value = 100
    if (result.failed.length) {
      const detail = result.failed
        .slice(0, 3)
        .map((f) => `${f.name}(${f.error})`)
        .join('; ')
      ElMessage.warning(
        `已上传 ${result.uploaded.length}，失败 ${result.failed.length}：${detail}`
      )
    } else {
      ElMessage.success(`已上传 ${result.uploaded.length} 个文件`)
    }
    await loadList(tokenStack.value[tokenStack.value.length - 1])
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e))
  } finally {
    setTimeout(() => (uploadPercent.value = 0), 500)
  }
}

onMounted(async () => {
  try {
    config.value = await fetchConfig()
    prefix.value = config.value.defaultPrefix
    await loadList()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e))
  }
})
</script>

<template>
  <div class="page">
    <header class="header">
      <div>
        <h1>OSS Console</h1>
        <p v-if="config" class="meta">
          {{ config.bucket }} · {{ config.region }} · {{ config.security }}
        </p>
      </div>
      <el-tag type="info">本地自用 · 凭证仅在 server/.env</el-tag>
    </header>

    <section class="toolbar">
      <el-input
        v-model="prefix"
        placeholder="前缀，如 dev/AI-training/"
        clearable
        @keyup.enter="navigatePrefix(prefix)"
      >
        <template #prepend>Prefix</template>
        <template #append>
          <el-button @click="navigatePrefix(prefix)">进入</el-button>
        </template>
      </el-input>
      <el-upload
        multiple
        :show-file-list="false"
        :http-request="customUpload"
        :accept="ACCEPT_EXT"
      >
        <el-button type="primary" plain>上传到当前前缀</el-button>
      </el-upload>
      <el-button :disabled="!selectedKeys.length" type="danger" @click="confirmDelete">
        删除选中 ({{ selectedKeys.length }})
      </el-button>
      <el-button :loading="loading" @click="loadList(tokenStack[tokenStack.length - 1])">
        刷新
      </el-button>
    </section>

    <el-progress
      v-if="uploadPercent > 0 && uploadPercent < 100"
      :percentage="uploadPercent"
      :stroke-width="6"
      class="progress"
    />

    <nav class="breadcrumb">
      <span
        v-for="(part, idx) in breadcrumbParts"
        :key="part.path"
        class="crumb"
        @click="navigatePrefix(part.path)"
      >
        {{ part.label }}<span v-if="idx < breadcrumbParts.length - 1"> / </span>
      </span>
    </nav>

    <div v-if="directories.length" class="dirs">
      <el-button
        v-for="dir in directories"
        :key="dir"
        link
        type="primary"
        @click="enterDirectory(dir)"
      >
        📁 {{ dir.replace(prefix, '') || dir }}
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="files"
      stripe
      border
      @selection-change="(rows: OssFileRow[]) => (selectedKeys = rows.map((r) => r.key))"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column prop="name" label="文件名" min-width="200" show-overflow-tooltip />
      <el-table-column prop="key" label="Key" min-width="280" show-overflow-tooltip />
      <el-table-column label="大小" width="100">
        <template #default="{ row }">{{ formatBytes(row.size) }}</template>
      </el-table-column>
      <el-table-column prop="lastModified" label="修改时间" width="200" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="previewFile(row)">预览</el-button>
          <el-button link @click="copyKey(row.key)">复制 Key</el-button>
        </template>
      </el-table-column>
    </el-table>

    <footer class="pager">
      <el-button :disabled="!tokenStack.length" @click="loadPrevPage">上一页</el-button>
      <el-button :disabled="!nextToken" @click="loadNextPage">下一页</el-button>
      <span v-if="nextToken" class="hint">还有更多对象</span>
    </footer>
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  letter-spacing: -0.02em;
}

.meta {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.875rem;
}

.toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 12px;
}

.toolbar .el-input {
  flex: 1;
  min-width: 280px;
}

.progress {
  margin: 4px 0 12px;
}

.breadcrumb {
  margin-bottom: 12px;
  font-size: 0.875rem;
  color: #475569;
}

.crumb {
  cursor: pointer;
}

.crumb:hover {
  color: #2563eb;
}

.dirs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.pager {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.hint {
  color: #94a3b8;
  font-size: 0.875rem;
}
</style>
