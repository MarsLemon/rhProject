import path from 'path'
import { fileURLToPath } from 'url'

const encodingDir = path.dirname(fileURLToPath(import.meta.url))
export const monorepoRoot = path.join(encodingDir, '../..')
export const v3Root = path.join(monorepoRoot, 'wk-train-center-ui-v3')
export const vue2Root = path.join(monorepoRoot, 'wk-train-center-ui')
export const encodingScriptsDir = encodingDir
