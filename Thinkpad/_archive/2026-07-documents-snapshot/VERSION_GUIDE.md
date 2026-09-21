# 版本与 Git 分支管理规范

## 概述

本文档定义项目版本与 Git 分支的对应关系，以及文档自动归类规则。

## 分支命名规范

### 分支类型

| 分支类型 | 命名格式 | 示例 | 说明 |
|---------|---------|------|------|
| 功能开发分支 | `local/X.X/dev` | `local/1.3/dev` | 开发中版本 |
| 发布分支 | `local/release` | `local/release` | 准备发布 |
| 预发布分支 | `stage` | `stage` | 测试环境 |
| 主干分支 | `master` | `master` | 正式发布版本 |
| 开发主干 | `develop` | `develop` | 开发主线 |

### 历史版本分支

| 分支 | 版本 | 状态 |
|------|------|------|
| `train-center-v1.0` | v1.0 | 已归档 |
| `train-center-v1.1` | v1.1 | 已归档 |
| `train-center-v1.2` | v1.2 | 已发布 |
| `train-center-v1.2-xxx` | v1.2 | 功能分支 |

## 版本目录结构

```
documents/
├── versions.json          # 版本配置（自动维护）
├── 1.0/                   # v1.0 文档
├── 1.1/                   # v1.1 文档
├── 1.2/                   # v1.2 文档
├── 1.3/                   # v1.3 文档（开发中）
├── develop/               # 开发主线文档
├── release/               # 发布准备文档
├── stage/                 # 测试文档
└── main/                  # 主干文档
```

## 版本配置

### versions.json

配置文件位于 `documents/versions.json`，记录：

- 当前分支与版本
- 所有分支的映射关系
- 版本状态（开发中/已完成/已发布）

### 维护规则

1. **新版本开发**
   ```bash
   # 创建新分支
   git checkout -b local/1.4/dev
   
   # 更新 versions.json
   # 添加 "local/1.4/dev": { "version": "1.4", "status": "开发中" }
   ```

2. **版本发布**
   ```bash
   # 合并到 master
   git checkout master
   git merge local/1.3/dev
   
   # 更新 versions.json
   # 将 "local/1.3/dev" 状态改为 "已完成"
   # 添加 "released": "2026-04-17"
   ```

3. **版本归档**
   ```bash
   # 推送标签
   git tag -a v1.3 -m "v1.3 发布"
   git push origin v1.3
   
   # 更新分支状态
   # versions.json 中添加 "archived": true
   ```

## 文档自动归类

### 自动获取 Git 信息

创建文档时，系统会自动获取以下 Git 信息：

| 信息 | Git 命令 | 说明 |
|------|---------|------|
| Git分支 | `git branch --show-current` | 获取当前分支 |
| 作者 | `git config user.name` | 获取 Git 用户名 |
| 版本 | 从分支名解析 | 如 `local/1.3/dev` → `1.3` |

### 规则

| Git 分支 | 文档目录 | 版本号 |
|---------|---------|-------|
| `local/1.3/dev` | `documents/1.3/` | v1.3 |
| `local/1.2/dev` | `documents/1.2/` | v1.2 |
| `local/1.1` | `documents/1.1/` | v1.1 |
| `local/release` | `documents/release/` | latest |
| `stage` | `documents/stage/` | staging |
| `master` | `documents/` | main |
| `develop` | `documents/develop/` | develop |

### 自动检测逻辑

1. **优先级1**：读取 `versions.json` 的 `branches` 映射
2. **优先级2**：从分支名自动解析（正则匹配 `local/(\d+.\d+)/dev`）
3. **优先级3**：使用默认值 `develop`

## 文档命名规范

### 格式

```
YYYYMMDD-模块-文档类型.md
```

### 示例

| 日期 | 模块 | 文档类型 | 文件名 |
|------|------|---------|--------|
| 20260417 | 课程 | 优化建议 | `20260417-课程-优化建议.md` |
| 20260417 | 考试 | 需求设计 | `20260417-考试-需求设计.md` |
| 20260417 | 系统 | 技术方案 | `20260417-系统-技术方案.md` |
| 20260417 | AI | 需求设计 | `20260417-AI-需求设计.md` |

## 文档元数据

所有文档头部必须包含：

```markdown
> Git分支：local/1.3/dev  
> 文档版本：v1.3  
> 创建日期：2026-04-17  
> 作者：van  
> 状态：草稿/评审中/已采纳
```

**注意**：作者信息会自动从 `git config user.name` 获取，无需手动填写。

## 最佳实践

### 1. 文档创建流程

1. 确认当前 Git 分支和作者信息
2. 自动识别版本目录
3. 使用 `doc-standardizer` skill 生成文档
4. 文档自动包含分支信息和作者信息（从 Git 自动获取）

## 脚本工具

### 分支切换脚本

创建 `scripts/switch-version.ps1`：

```powershell
param(
    [Parameter(Mandatory=$true)]
    [string]$Branch
)

# 切换分支
git checkout $Branch

# 获取当前分支名
$currentBranch = git branch --show-current

# 解析版本号
if ($currentBranch -match "local/(\d+\.\d+)/dev") {
    $version = $matches[1]
    Write-Host "切换到版本: $version" -ForegroundColor Green
    
    # 检查目录是否存在
    $docDir = "documents/$version"
    if (-not (Test-Path $docDir)) {
        New-Item -ItemType Directory -Path $docDir | Out-Null
        Write-Host "已创建目录: $docDir" -ForegroundColor Yellow
    }
} else {
    Write-Host "当前分支: $currentBranch" -ForegroundColor Cyan
}
```

### 使用方法

```powershell
# 切换到 1.3 版本开发
.\scripts\switch-version.ps1 -Branch "local/1.3/dev"

# 切换到 1.4 版本开发（新版本）
.\scripts\switch-version.ps1 -Branch "local/1.4/dev"
```

## 版本发布流程

1. 在功能分支完成开发
2. 创建 PR 合并到 `stage` 进行测试
3. 测试通过后合并到 `master`
4. 创建版本标签 `git tag -a v1.3 -m "v1.3 发布"`
5. 更新 `versions.json` 状态

### 版本回滚

1. 从 `master` 检出到新分支 `local/1.3.1/dev`
2. 修复问题
3. 重新发布

## 相关文件

| 文件 | 说明 |
|------|------|
| `documents/versions.json` | 版本配置 |
| `.qoder/skills/doc-standardizer/SKILL.md` | 文档生成规范 |
| `scripts/switch-version.ps1` | 分支切换脚本 |

## 维护记录

| 日期 | 版本 | 操作 | 说明 |
|------|------|------|------|
| 2026-04-17 | 1.3 | 创建 | 初始版本配置 |
