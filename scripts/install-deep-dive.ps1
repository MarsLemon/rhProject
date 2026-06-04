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
