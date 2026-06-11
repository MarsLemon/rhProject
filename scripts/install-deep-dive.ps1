# [Skill] 同时把 skill-deep-dive 安装到 Cursor 和 Claude 全局 skills，并同步 wiki 索引
# 运行: pwsh scripts/install-deep-dive.ps1
# 目标: %USERPROFILE%\.cursor\skills + %USERPROFILE%\.claude\skills
$ErrorActionPreference = 'Stop'
$base = 'https://raw.githubusercontent.com/davethegut/deep-dive-skill/main'
$dirs = @(
  (Join-Path $env:USERPROFILE '.cursor\skills\skill-deep-dive'),
  (Join-Path $env:USERPROFILE '.claude\skills\skill-deep-dive')
)
$files = @('SKILL.md', 'template.html', 'AGENTS.md')
foreach ($dir in $dirs) {
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  foreach ($f in $files) {
    $url = "$base/$f"
    $out = Join-Path $dir $f
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
    Write-Host "OK $out"
  }
}
Set-Location 'e:\rhProject'
node scripts\sync-cursor-wiki-index.mjs
Write-Host 'Wiki sync done.'
