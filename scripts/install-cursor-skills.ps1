# [Skill] 从 GitHub 拉取 find-skills / skill-cleaner 安装到全局 Cursor skills
# 运行: pwsh scripts/install-cursor-skills.ps1
# 目标: %USERPROFILE%\.cursor\skills
$ErrorActionPreference = 'Stop'
$skillsRoot = Join-Path $env:USERPROFILE '.cursor\skills'

function Install-SkillMd {
    param([string]$Name, [string]$Url)
    $dir = Join-Path $skillsRoot $Name
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Invoke-WebRequest -Uri $Url -OutFile (Join-Path $dir 'SKILL.md') -UseBasicParsing
    Write-Host "OK $Name/SKILL.md"
}

Install-SkillMd 'find-skills' 'https://raw.githubusercontent.com/vercel-labs/skills/main/skills/find-skills/SKILL.md'

$cleanerDir = Join-Path $skillsRoot 'skill-cleaner'
$scriptsDir = Join-Path $cleanerDir 'scripts'
New-Item -ItemType Directory -Force -Path $scriptsDir | Out-Null
Install-SkillMd 'skill-cleaner' 'https://raw.githubusercontent.com/steipete/agent-scripts/main/skills/skill-cleaner/SKILL.md'
Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/steipete/agent-scripts/main/skills/skill-cleaner/scripts/skill-cleaner.ts' -OutFile (Join-Path $scriptsDir 'skill-cleaner.ts') -UseBasicParsing
Write-Host "OK skill-cleaner/scripts/skill-cleaner.ts"
Write-Host "Done: $skillsRoot"
