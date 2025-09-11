# Script de lancement Solisakane Android
# Solisakane Android Launch Script

Write-Host "========================================" -ForegroundColor Green
Write-Host "    Solisakane - Lancement Android" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "[1/3] Vérification de l'émulateur..." -ForegroundColor Yellow
adb devices
Write-Host ""

Write-Host "[2/3] Démarrage de Metro Bundler..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start"

Write-Host "Attente du démarrage de Metro (15 secondes)..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

Write-Host "[3/3] Lancement de l'application..." -ForegroundColor Yellow
npx react-native run-android

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    Application lancée !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Cyan
Read-Host
