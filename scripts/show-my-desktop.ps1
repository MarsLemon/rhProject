# [System] 列出桌面文件清单（把 pixpin-desktop-screenshots 技能输出到 _desktop_list.txt 后再打印）
# 运行: pwsh scripts/show-my-desktop.ps1
$OutFile = 'e:\rhProject\_desktop_list.txt'
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.cursor\skills\pixpin-desktop-screenshots\scripts\show-desktop.ps1" -OutFile $OutFile
Get-Content -LiteralPath $OutFile
