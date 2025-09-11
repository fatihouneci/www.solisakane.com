# Script de correction du problème Notifee
# Fix Notifee problem script

Write-Host "========================================" -ForegroundColor Green
Write-Host "    Correction du Problème Notifee" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "[1/4] Sauvegarde du package.json..." -ForegroundColor Yellow
Copy-Item "package.json" "package-backup.json" -Force

Write-Host "[2/4] Suppression temporaire de Notifee..." -ForegroundColor Yellow
# Créer un package.json temporaire sans Notifee
$packageContent = Get-Content "package.json" | ConvertFrom-Json
$packageContent.dependencies.PSObject.Properties.Remove('@notifee/react-native')
$packageContent | ConvertTo-Json -Depth 10 | Set-Content "package.json"

Write-Host "[3/4] Réinstallation des dépendances..." -ForegroundColor Yellow
npm install

Write-Host "[4/4] Nettoyage et compilation..." -ForegroundColor Yellow
Set-Location android
./gradlew clean
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    Correction terminée !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Vous pouvez maintenant lancer :" -ForegroundColor Cyan
Write-Host "  npm run android" -ForegroundColor White
Write-Host ""
Write-Host "Pour restaurer Notifee plus tard :" -ForegroundColor Cyan
Write-Host "  .\restore-notifee.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Cyan
Read-Host
