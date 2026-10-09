@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22 or newer from https://nodejs.org/ then reopen this launcher.
  pause
  exit /b 1
)
node -e "if(Number(process.versions.node.split('.')[0])<22)process.exit(1)"
if errorlevel 1 (
  echo Cupid needs Node.js 22 or newer. Update Node.js from https://nodejs.org/
  pause
  exit /b 1
)
node server.mjs --open
if errorlevel 1 pause
