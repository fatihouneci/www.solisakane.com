# Script de restauration de Notifee
# Restore Notifee script

Write-Host "========================================" -ForegroundColor Green
Write-Host "    Restauration de Notifee" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "[1/3] Restauration du package.json original..." -ForegroundColor Yellow
Copy-Item "package-backup.json" "package.json" -Force

Write-Host "[2/3] Réinstallation avec Notifee..." -ForegroundColor Yellow
npm install --legacy-peer-deps

Write-Host "[3/3] Nettoyage..." -ForegroundColor Yellow
Set-Location android
./gradlew clean
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    Notifee restauré !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Cyan
Read-Host
