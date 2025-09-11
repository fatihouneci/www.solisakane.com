@echo off
echo ========================================
echo    Solisakane - Lancement Android
echo ========================================
echo.

echo [1/3] Verification de l'emulateur...
adb devices
echo.

echo [2/3] Demarrage de Metro Bundler...
start "Metro Bundler" cmd /k "npm start"

echo Attente du demarrage de Metro (10 secondes)...
timeout /t 10 /nobreak > nul

echo [3/3] Lancement de l'application...
npx react-native run-android

echo.
echo ========================================
echo    Application lancee !
echo ========================================
pause
