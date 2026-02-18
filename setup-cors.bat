@echo off
REM Firebase Storage CORS Setup Script for Windows
REM This script configures CORS for Firebase Storage to allow audio playback

echo ========================================
echo Firebase Storage CORS Configuration
echo ========================================
echo.

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not found!
    echo Please install Node.js first: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if gsutil is available
where gsutil >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: gsutil is not found!
    echo.
    echo Using Node.js method instead (no gsutil needed)...
    echo.
    echo Installing required package...
    call npm install @google-cloud/storage
    echo.
    echo Running CORS setup script...
    echo NOTE: Make sure to update PROJECT_ID and BUCKET_NAME in set-cors.js if needed!
    echo.
    call node set-cors.js
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ========================================
        echo SUCCESS! CORS configured via Node.js
        echo ========================================
    ) else (
        echo.
        echo ========================================
        echo FAILED: Could not set CORS
        echo ========================================
        echo.
        echo To use gsutil method instead:
        echo 1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install-sdk#windows
        echo 2. Install with "Add to PATH" checked
        echo 3. Restart terminal and run this script again
        echo.
        echo Or authenticate for Node.js method:
        echo 1. Install Google Cloud SDK
        echo 2. Run: gcloud auth application-default login
        echo 3. Run this script again
    )
    pause
    exit /b
)

REM If gsutil is available, use the original method
echo Step 1: Authenticating with Google Cloud...
echo Please log in when prompted...
gcloud auth login

echo.
echo Step 2: Setting Firebase project...
echo Enter your Firebase project ID (e.g., monody-nasheeds):
set /p PROJECT_ID="Project ID: "
gcloud config set project %PROJECT_ID%

echo.
echo Step 3: Finding Storage bucket...
echo Your bucket name is likely: %PROJECT_ID%.appspot.com
set /p BUCKET_NAME="Enter bucket name (or press Enter for default): "
if "%BUCKET_NAME%"=="" set BUCKET_NAME=%PROJECT_ID%.appspot.com

echo.
echo Step 4: Applying CORS configuration...
gsutil cors set storage-cors.json gs://%BUCKET_NAME%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! CORS configuration applied.
    echo ========================================
    echo.
    echo Verifying configuration...
    gsutil cors get gs://%BUCKET_NAME%
) else (
    echo.
    echo ERROR: Failed to apply CORS configuration.
    echo Please check:
    echo 1. You have Storage Admin permissions
    echo 2. The bucket name is correct
    echo 3. You're authenticated: gcloud auth login
)

echo.
pause
