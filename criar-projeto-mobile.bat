@echo off
echo ========================================
echo    CRIANDO PROJETO REACT NATIVE
echo ========================================
echo.

echo 1. Saindo da pasta atual...
cd ..

echo 2. Verificando pasta atual...
echo Pasta atual: %CD%

echo.
echo 3. Criando projeto React Native...
echo Nome do projeto: EcommerceMobile
echo.

npx react-native init EcommerceMobile --template react-native-template-typescript

echo.
echo 4. Entrando na pasta do projeto...
cd EcommerceMobile

echo.
echo 5. Instalando dependencias basicas...
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
npm install react-native-vector-icons react-native-linear-gradient
npm install react-native-qrcode-svg react-native-svg
npm install @react-native-async-storage/async-storage
npm install react-native-paper react-native-gesture-handler
npm install react-native-reanimated

echo.
echo 6. Criando estrutura de pastas...
mkdir src\components
mkdir src\screens
mkdir src\navigation
mkdir src\context
mkdir src\services
mkdir src\utils
mkdir src\styles

echo.
echo ========================================
echo    PROJETO CRIADO COM SUCESSO!
echo ========================================
echo.
echo Projeto criado em: %CD%
echo.
echo Proximos passos:
echo 1. cd EcommerceMobile
echo 2. Configurar Firebase
echo 3. Copiar codigo dos componentes
echo 4. npx react-native run-android
echo.
echo Pressione qualquer tecla para continuar...
pause > nul
