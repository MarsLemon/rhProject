#!/usr/bin/env node
/**
 * [Encoding-Lib] 编码子系统的共享路径常量 (monorepoRoot / v3Root / vue2Root / encodingScriptsDir)
 * 运行: 不直接运行，供同目录下其他脚本 import 使用。
 */
import path from 'path'
import { fileURLToPath } from 'url'

const encodingDir = path.dirname(fileURLToPath(import.meta.url))
export const monorepoRoot = path.join(encodingDir, '../..')
export const v3Root = path.join(monorepoRoot, 'wk-train-center-ui-v3')
export const vue2Root = path.join(monorepoRoot, 'wk-train-center-ui')
export const encodingScriptsDir = encodingDir
