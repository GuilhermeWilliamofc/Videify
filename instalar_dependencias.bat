@echo off
echo ============================================
echo  Instalando dependencias do Videify...
echo ============================================
echo.

:: Verifica se Python esta instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    py --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERRO] Python nao encontrado!
        echo.
        echo Por favor, instale o Python:
        echo   1. Acesse: https://www.python.org/downloads/
        echo   2. Baixe e instale o Python
        echo   3. IMPORTANTE: Marque a opcao "Add Python to PATH" na primeira tela do instalador!
        echo   4. Reinicie o computador apos a instalacao
        echo   5. Execute este script novamente
        echo.
        pause
        exit /b 1
    )
    set PYTHON_CMD=py
) else (
    set PYTHON_CMD=python
)

echo [OK] Python encontrado!
echo.
echo Instalando pytubefix...
%PYTHON_CMD% -m pip install pytubefix --upgrade
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar pytubefix.
    pause
    exit /b 1
)

echo.
echo [OK] pytubefix instalado com sucesso!
echo.

echo Instalando bibliotecas para Remocao de Fundo...
%PYTHON_CMD% -m pip install "rembg[cpu]" onnxruntime pillow --upgrade
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar rembg e pillow.
    pause
    exit /b 1
)

echo.
echo [OK] Dependencias de IA (rembg) instaladas com sucesso!
echo.

echo ============================================
echo  Tudo pronto! Pode abrir o Videify agora.
echo ============================================
echo.
pause
