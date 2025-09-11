# Script de configuration pour les tests sans Notifee
# Setup script for testing without Notifee

Write-Host "========================================" -ForegroundColor Green
Write-Host "    Solisakane - Configuration Test" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "[1/4] Sauvegarde du package.json original..." -ForegroundColor Yellow
Copy-Item "package.json" "package-original.json" -Force

Write-Host "[2/4] Installation des dépendances de test..." -ForegroundColor Yellow
Copy-Item "package-test.json" "package.json" -Force

Write-Host "[3/4] Installation des dépendances..." -ForegroundColor Yellow
npm install

Write-Host "[4/4] Nettoyage du cache Android..." -ForegroundColor Yellow
Set-Location android
./gradlew clean
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    Configuration de test terminée !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Vous pouvez maintenant lancer :" -ForegroundColor Cyan
Write-Host "  npm run android" -ForegroundColor White
Write-Host ""
Write-Host "Pour restaurer la configuration originale :" -ForegroundColor Cyan
Write-Host "  .\restore-original.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Cyan
Read-Host
