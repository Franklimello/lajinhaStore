@echo off
echo 🚀 Script de Limpeza Rápida - Coleções de Sorteio
echo ================================================
echo.
echo Este script vai limpar as coleções:
echo - sorteio
echo - sorteio_vencedores
echo.
echo ⚠️  ATENÇÃO: Esta ação é irreversível!
echo.
pause

echo.
echo 🔍 Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado! Instale o Node.js primeiro.
    pause
    exit /b 1
)

echo.
echo 🔍 Verificando Firebase...
npm list firebase
if %errorlevel% neq 0 (
    echo 📦 Instalando Firebase...
    npm install firebase
)

echo.
echo 🧹 Executando limpeza...
node limpar-todas-colecoes-sorteio.js

echo.
echo ✅ Script concluído!
pause
