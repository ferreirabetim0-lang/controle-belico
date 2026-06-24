Write-Host "Iniciando Controle Belico Backend..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\apps\backend"
node dist/main.js
