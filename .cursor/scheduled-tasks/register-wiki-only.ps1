# Register Wiki task only (backward compatible)
param(
  [string]$DailyAt = '08:00',
  [switch]$Unregister
)

$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$args = @('-Task', 'Wiki', '-WikiDailyAt', $DailyAt)
if ($Unregister) { $args += '-Unregister' }
& (Join-Path $Here 'register.ps1') @args
