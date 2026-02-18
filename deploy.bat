@echo off
REM Firebase Deployment Script for Windows
REM This script ensures a fresh build before deploying

echo Cleaning old build...
if exist client\dist rmdir /s /q client\dist

echo Building client...
cd client
call npm install
call npm run build
cd ..

echo Build complete!
echo Deploying to Firebase...
firebase deploy --only hosting

echo Deployment complete!
pause
