@echo off
echo ========================================
echo Videify - Reinicializacao Completa
echo ========================================
echo.

echo [1/4] Encerrando processos Electron antigos...
taskkill /F /IM "Videify.exe" 2>nul
timeout /t 1 /nobreak >nul

echo [2/4] Limpando cache do Electron...
if exist "%APPDATA%\Videify\Cache" (
    rmdir /s /q "%APPDATA%\Videify\Cache" 2>nul
    echo Cache limpo!
) else (
    echo Nenhum cache encontrado.
)

echo [3/4] Limpando cache do Node...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache" 2>nul
)

echo [4/4] Iniciando Videify...
echo.
npm start
