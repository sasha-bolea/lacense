@echo off
cd /d "%~dp0"

echo.
echo  LACENSE ADMIN — Avvio in corso...
echo.

where java >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERRORE] Java non trovato.
    echo  Scaricalo da: https://adoptium.net
    echo.
    pause
    exit /b 1
)

if not exist LacenseAdmin.class (
    echo  Compilazione...
    javac LacenseAdmin.java
    if %errorlevel% neq 0 (
        echo  [ERRORE] Compilazione fallita.
        pause
        exit /b 1
    )
)

start "" javaw LacenseAdmin
