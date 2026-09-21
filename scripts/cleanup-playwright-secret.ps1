#Requires -Version 5.1
<#
.SYNOPSIS
  清理 rhProject 仓库中泄露的 PLAYWRIGHT_MCP_EXTENSION_TOKEN，刷新 PRD-wk-* tag。
  全自动执行 filter-repo + tag 重建 + 验证。
  force push 不在此脚本内执行（需用户明确确认）。
#>

$ErrorActionPreference = "Stop"
Set-Location "e:/rhProject"

$SECRET = "__oiP3l_token_redacted_in_script__"
$REPLACEMENT = "__PLAYWRIGHT_MCP_EXTENSION_TOKEN_REMOVED__"
$BACKUP_FILE = "C:\Users\RUHAI\tag-refs-backup.txt"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  rhProject secret cleanup pipeline" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# -------- [1/7] 备份 tag 指向 --------
Write-Host "[1/7] 备份 8 个 PRD-wk-* tag 指向..." -ForegroundColor Yellow
$backupLines = @()
git tag -l "PRD-wk-*" | ForEach-Object {
    $hash = git rev-list -1 $_
    $line = "$_ $hash"
    $backupLines += $line
    Write-Host "       $_ -> $hash"
}
$backupLines | Out-File -Encoding UTF8 $BACKUP_FILE
Write-Host "       备份: $BACKUP_FILE" -ForegroundColor Green
Write-Host ""

# -------- [2/7] git status 快照 --------
Write-Host "[2/7] 备份当前 git log 到 C:\Users\RUHAI\commit-log-before.txt..." -ForegroundColor Yellow
git log --all --oneline > C:\Users\RUHAI\commit-log-before.txt
Write-Host "       OK" -ForegroundColor Green
Write-Host ""

# -------- [3/7] 删除所有 PRD-wk-* tag (filter-repo 会丢失 tag 引用,先备份再重建) --------
Write-Host "[3/7] 临时删除 8 个 PRD-wk-* tag (filter-repo 会清掉 backup refs)..." -ForegroundColor Yellow
git tag -l "PRD-wk-*" | ForEach-Object { git tag -d $_ }
Write-Host "       OK" -ForegroundColor Green
Write-Host ""

# -------- [4/7] filter-repo 重写历史 --------
Write-Host "[4/7] git filter-repo 重写历史..." -ForegroundColor Yellow
$remoteUrl = git remote get-url origin
git remote remove origin

$mapFile = "C:\Users\RUHAI\secret-replacement.txt"
$mapContent = "$SECRET==>$REPLACEMENT"
$mapContent | Out-File -Encoding UTF8 -NoNewline $mapFile

git filter-repo --force --replace-text $mapFile

git remote add origin $remoteUrl
Remove-Item $mapFile -Force
Write-Host "       filter-repo 完成" -ForegroundColor Green
Write-Host ""

# -------- [5/7] 基于 commit message 自动匹配重建 8 个 tag --------
Write-Host "[5/7] 基于 commit message 匹配重建 8 个 PRD-wk-* tag..." -ForegroundColor Yellow
Write-Host "       当前新 commit log:" -ForegroundColor Cyan
git log --all --oneline | Select-Object -First 25 | ForEach-Object { Write-Host "         $_" }
Write-Host ""

# tag 重建策略: 在新 log 中查找最匹配的 commit
function Find-NewHash($hintPatterns) {
    foreach ($pattern in $hintPatterns) {
        $match = git log --all --oneline | Select-String -Pattern $pattern | Select-Object -First 1
        if ($match) {
            $line = $match.ToString().Trim()
            return ($line -split '\s+')[0]
        }
    }
    return $null
}

$tagMappings = [ordered]@{
    "PRD-wk-PPTist-ui-v0.1.0"           = @("PPTist.*v0\.1", "PPTist")
    "PRD-wk-mhc-mobile-v0.1.0"          = @("mhc-mobile.*v0\.1", "mhc-mobile")
    "PRD-wk-mhc-ui-v0.1.0"              = @("mhc-ui.*v0\.1", "mhc-ui")
    "PRD-wk-train-center-service-v1.0.0" = @("train-center-service.*v1\.0")
    "PRD-wk-train-center-ui-v0.1.0"     = @("train-center-ui.*v0\.1", "train-center-ui")
    "PRD-wk-train-center-ui-v3-v0.1.0"  = @("train-center-ui-v3.*v0\.1", "train-center-ui-v3")
    "PRD-wk-train-center-v1.0.0"        = @("train-center.*v1\.0", "PRD-wk-train-center-v1\.0")
    "PRD-wk-train-center-v1.1.0"        = @("train-center.*v1\.1", "PRD-wk-train-center-v1\.1")
}

$rebuiltTags = @()
$failedTags = @()
foreach ($kv in $tagMappings.GetEnumerator()) {
    $tagName = $kv.Key
    $hints = $kv.Value
    $newHash = Find-NewHash $hints
    if ($newHash) {
        git tag $tagName $newHash
        Write-Host "       [OK]   $tagName -> $newHash" -ForegroundColor Green
        $rebuiltTags += $tagName
    } else {
        Write-Host "       [FAIL] $tagName 无匹配 commit" -ForegroundColor Red
        $failedTags += $tagName
    }
}
Write-Host ""
if ($failedTags.Count -gt 0) {
    Write-Host "       失败的 tag 需要人工重建: $($failedTags -join ', ')" -ForegroundColor Yellow
}
Write-Host ""

# -------- [6/7] 验证: 全历史 grep secret --------
Write-Host "[6/7] 验证: 全历史 grep secret..." -ForegroundColor Yellow
$hits = git grep -F "$SECRET" $(git rev-list --all) 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "       [FAIL] 仍有 $($hits.Count) 处残留:" -ForegroundColor Red
    $hits | Select-Object -First 5 | ForEach-Object { Write-Host "         $_" -ForegroundColor Red }
} else {
    Write-Host "       [PASS] 全历史 0 命中, secret 已彻底清除" -ForegroundColor Green
}
Write-Host ""

# -------- [7/7] 输出后续命令 (不执行) --------
Write-Host "[7/7] 后续命令 (需用户确认后再执行):" -ForegroundColor Yellow
Write-Host "       git push --force-with-lease origin main" -ForegroundColor White
Write-Host "       git push --force --tags" -ForegroundColor White
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  本地清理完成。" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
