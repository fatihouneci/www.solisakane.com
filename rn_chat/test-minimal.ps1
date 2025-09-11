# Script de test minimal - Solisakane
# Minimal test script - Solisakane

Write-Host "========================================" -ForegroundColor Green
Write-Host "    Solisakane - Test Minimal" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "[1/5] Vérification de l'émulateur..." -ForegroundColor Yellow
adb devices
Write-Host ""

Write-Host "[2/5] Nettoyage complet..." -ForegroundColor Yellow
Set-Location android
./gradlew clean
./gradlew --stop
Set-Location ..
Write-Host ""

Write-Host "[3/5] Démarrage de Metro..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start"

Write-Host "[4/5] Attente du démarrage Metro (20 secondes)..." -ForegroundColor Cyan
Start-Sleep -Seconds 20

Write-Host "[5/5] Lancement avec configuration minimale..." -ForegroundColor Yellow
Write-Host "Tentative de lancement sans Notifee..." -ForegroundColor White

# Essayer de lancer avec des options spécifiques
try {
    npx react-native run-android --no-packager --verbose
} catch {
    Write-Host "Erreur lors du lancement. Vérifiez les logs ci-dessus." -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    Test terminé" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Si l'application s'est lancée, vous devriez voir l'écran Solisakane sur l'émulateur." -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Cyan
Read-Host
