$OutFile = 'e:\rhProject\_desktop_list.txt'
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.cursor\skills\pixpin-desktop-screenshots\scripts\show-desktop.ps1" -OutFile $OutFile
Get-Content -LiteralPath $OutFile
