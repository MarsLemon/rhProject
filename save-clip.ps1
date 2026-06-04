# save-clip.ps1
# 把剪贴板里的图片保存为 png 到 E:\rhProject\screenshots\
# 用法：.\save-clip.ps1

param(
    [string]$OutDir = "E:\rhProject\screenshots"
)

if (-not (Test-Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir | Out-Null
}

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

if (-not [System.Windows.Forms.Clipboard]::ContainsImage()) {
    Write-Host "剪贴板里没有图片，先截图再试" -ForegroundColor Yellow
    return
}

$img = [System.Windows.Forms.Clipboard]::GetImage()
$file = Join-Path $OutDir "clip_$(Get-Date -Format 'yyyyMMdd_HHmmss').png"
$img.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "已保存: $file" -ForegroundColor Green
