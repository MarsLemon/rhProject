# setup-clip.ps1
# 在当前 PowerShell 会话里注册 clip 函数，指向 E:\rhProject\save-clip.ps1
# 跑一次以后当前窗口就能用 clip

function clip {
    & "E:\rhProject\save-clip.ps1" @args
}

Set-Alias -Name clip -Value clip -Scope Global -Force
Write-Host "已注册 clip 函数，截图后输入 clip 即可" -ForegroundColor Green
