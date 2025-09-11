# Script de restauration de la configuration originale
# Restore original configuration script

Write-Host "========================================" -ForegroundColor Green
Write-Host "    Solisakane - Restauration Originale" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "[1/2] Restauration du package.json original..." -ForegroundColor Yellow
Copy-Item "package-original.json" "package.json" -Force

Write-Host "[2/2] Réinstallation des dépendances complètes..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    Configuration originale restaurée !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Cyan
Read-Host
