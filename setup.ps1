# ============================================================
# CONTROLE BÉLICO — Setup Completo
# Execute: .\setup.ps1
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONTROLE BELICO — Setup do Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Instalar dependências do backend
Write-Host "[1/4] Instalando dependencias do backend..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\apps\backend"
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "ERRO ao instalar backend" -ForegroundColor Red; exit 1 }
Write-Host "OK" -ForegroundColor Green

# 2. Instalar dependências do package/database
Write-Host ""
Write-Host "[2/4] Instalando dependencias do database package..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\packages\database"
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "ERRO ao instalar database" -ForegroundColor Red; exit 1 }
Write-Host "OK" -ForegroundColor Green

# 3. Gerar o Prisma Client
Write-Host ""
Write-Host "[3/4] Gerando Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) { Write-Host "ERRO ao gerar Prisma Client" -ForegroundColor Red; exit 1 }
Write-Host "OK" -ForegroundColor Green

# 4. Rodar migrations
Write-Host ""
Write-Host "[4/4] Rodando migrations no banco..." -ForegroundColor Yellow
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "AVISO: migrate deploy falhou. Tentando migrate dev..." -ForegroundColor Yellow
    npx prisma migrate dev --name init
}
Write-Host "OK" -ForegroundColor Green

# 5. Seed
Write-Host ""
Write-Host "[5/5] Criando dados iniciais (seed)..." -ForegroundColor Yellow
npx ts-node prisma/seed.ts
Write-Host "OK" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup concluido com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "  1. Abra um terminal e rode o backend:"
Write-Host "     cd apps\backend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "  2. Em outro terminal, rode o frontend:"
Write-Host "     cd apps\frontend && node ..\..\node_modules\next\dist\bin\next dev -p 3000" -ForegroundColor White
Write-Host ""
Write-Host "Login de demonstracao:" -ForegroundColor Cyan
Write-Host "  Email: demo@controlbelico.com.br" -ForegroundColor White
Write-Host "  Senha: demo123456" -ForegroundColor White
Write-Host ""
